import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, DeepPartial, In } from 'typeorm';
import { ProductStockEntity } from '../../entities/product.stock.entity';
import { ProductService } from '../product/product.service';
import { ProductMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { ProductStockReservationEntity } from '../../entities/product.stock.reservation.entity';

@Injectable()
export class StockService {
    constructor(
        @InjectDataSource() private readonly datasource: DataSource,

        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
    ) {}

    /**
     * 재고 조회
     * @param productId 상품 ID
     * @returns ProductStockEntity
     */
    getStockByProductId(productId: number): Promise<ProductStockEntity> {
        return this.datasource.getRepository(ProductStockEntity).findOne({
            where: {
                product: {
                    id: productId,
                },
            },
            relations: ['product'],
        });
    }

    /**
     * 재고 업데이트
     * @param request ProductMicroService.UpsertStockQuantityRequest
     * @returns ProductStockEntity
     */
    async upsertStock(request: ProductMicroService.UpsertStockQuantityRequest): Promise<ProductStockEntity> {
        const product = await this.productService.getProductById({ id: request.productId });

        if (!product) {
            throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
        }

        await this.datasource.getRepository(ProductStockEntity).upsert(
            {
                product: product,
                quantity: request.quantity,
            },
            {
                conflictPaths: ['product'],
                skipUpdateIfNoValuesChanged: true,
            },
        );

        return await this.getStockByProductId(request.productId);
    }

    /**
     * 주문 재고 예약 조회
     * @param orderId 주문 ID
     * @returns ProductStockReservationEntity[]
     */
    async getStockReservationsByOrderId(orderId: string): Promise<ProductStockReservationEntity[]> {
        return await this.datasource.getRepository(ProductStockReservationEntity).find({
            where: { orderId },
            relations: ['product'],
        });
    }

    /**
     * 재고 예약
     * @param request ProductMicroService.CreateStockReservationRequest
     * @returns ProductStockReservationEntity[]
     */
    async createStockReservation(
        request: ProductMicroService.CreateStockReservationRequest,
    ): Promise<ProductStockReservationEntity[]> {
        const { reservations, orderId } = request;

        // qr
        const qr = this.datasource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const productIds = reservations.map(reservation => reservation.productId);

            const { total } = await this.productService.getProductsByIds({
                ids: reservations.map(reservation => reservation.productId),
            });

            if (total !== reservations.length) {
                throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
            }

            // 재고 예약 가능 여부 검증
            const stocks = await qr.manager.getRepository(ProductStockEntity).find({
                where: {
                    product: In(productIds),
                },
            });

            const reservationStocks = await qr.manager
                .getRepository(ProductStockReservationEntity)
                .createQueryBuilder('reservation')
                .select('reservation.productId', 'productId')
                .addSelect('SUM(reservation.reservedQty)', 'totalReservedQty')
                .where('reservation.productId IN (:...productIds)', { productIds })
                .andWhere('reservation.status = :status', {
                    status: ProductMicroService.StockReservationStatus.PENDING,
                })
                .andWhere('reservation.expiresAt > :now', { now: new Date() })
                .groupBy('reservation.productId')
                .getRawMany<{ productId: number; totalReservedQty: string }>();

            for (const reservation of reservations) {
                const { productId, reservedQty } = reservation;

                const stock = stocks.find(o => o.productId === productId)?.quantity ?? 0;
                if (!stock) {
                    throw new GrpcNotFoundException(`상품 ${productId} 재고를 찾을 수 없습니다`);
                }

                const reservedStock = reservationStocks.find(o => o.productId === productId)?.totalReservedQty ?? 0;

                const availableStock = stock - Number(reservedStock);

                if (availableStock < reservedQty) {
                    throw new GrpcNotFoundException(
                        `상품 ID ${productId}의 재고가 부족합니다. (재고: ${availableStock}, 요청: ${reservedQty})`,
                    );
                }
            }

            // 재고 예약 생성
            const stockReservations: DeepPartial<ProductStockReservationEntity>[] = reservations.map(reservation => ({
                product: { id: reservation.productId },
                reservedQty: reservation.reservedQty,
                expiresAt: new Date(Date.now() + 1000 * 60 * 5),
                orderId,
                status: ProductMicroService.StockReservationStatus.PENDING,
            }));
            await qr.manager.getRepository(ProductStockReservationEntity).save(stockReservations);

            const savedStockReservations = await qr.manager.getRepository(ProductStockReservationEntity).find({
                where: { orderId },
                relations: ['product'],
            });

            await qr.commitTransaction();

            return savedStockReservations;
        } catch (error) {
            await qr.rollbackTransaction();

            throw error;
        } finally {
            await qr.release();
        }
    }

    /**
     * 재고 예약 확정
     * @param request ProductMicroService.ConfirmStockReservationRequest
     * @returns ProductStockEntity
     */
    async confirmStockReservation(
        request: ProductMicroService.ConfirmStockReservationRequest,
    ): Promise<ProductStockReservationEntity[]> {
        const { orderId } = request;

        // qr
        const qr = this.datasource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const reservations = await qr.manager.getRepository(ProductStockReservationEntity).find({
                where: { orderId, status: ProductMicroService.StockReservationStatus.PENDING },
                relations: ['product'],
            });

            if (!reservations.length) {
                throw new GrpcNotFoundException('주문 재고 예약을 찾을 수 없습니다');
            }

            await qr.manager
                .getRepository(ProductStockReservationEntity)
                .update({ orderId }, { status: ProductMicroService.StockReservationStatus.CONFIRMED });

            for (const reservation of reservations) {
                await qr.manager.getRepository(ProductStockEntity).update(
                    {
                        product: { id: reservation.product.id },
                    },
                    {
                        quantity: () => `quantity - ${reservation.reservedQty}`,
                    },
                );
            }

            const updatedReservations = await qr.manager.getRepository(ProductStockReservationEntity).find({
                where: { orderId },
            });

            await qr.commitTransaction();

            return updatedReservations;
        } catch (error) {
            await qr.rollbackTransaction();

            throw error;
        } finally {
            await qr.release();
        }
    }

    /**
     * 재고 예약 복구
     * @param request ProductMicroService.RestoreStockReservationRequest
     */
    async restoreStockReservation(
        request: ProductMicroService.RestoreStockReservationRequest,
    ): Promise<ProductStockReservationEntity[]> {
        const { orderId } = request;

        // qr
        const qr = this.datasource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const reservations = await qr.manager.getRepository(ProductStockReservationEntity).find({
                where: { orderId, status: ProductMicroService.StockReservationStatus.CONFIRMED },
                relations: ['product'],
            });

            if (!reservations.length) {
                throw new GrpcNotFoundException('주문 재고 예약을 찾을 수 없습니다');
            }

            await qr.manager
                .getRepository(ProductStockReservationEntity)
                .update({ orderId }, { status: ProductMicroService.StockReservationStatus.RELEASED });

            for (const reservation of reservations) {
                await qr.manager.getRepository(ProductStockEntity).increment(
                    {
                        product: { id: reservation.product.id },
                    },
                    'quantity',
                    reservation.reservedQty,
                );
            }

            const updatedReservations = await qr.manager.getRepository(ProductStockReservationEntity).find({
                where: { orderId },
            });

            await qr.commitTransaction();

            return updatedReservations;
        } catch (error) {
            await qr.rollbackTransaction();

            throw error;
        } finally {
            await qr.release();
        }
    }
}
