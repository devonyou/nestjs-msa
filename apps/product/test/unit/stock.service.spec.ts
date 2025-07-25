import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
import { ProductStockEntity } from '../../src/entities/product.stock.entity';
import { StockService } from '../../src/modules/stock/stock.service';
import { TestBed } from '@automock/jest';
import { ProductService } from '../../src/modules/product/product.service';
import { ProductStockReservationEntity } from '../../src/entities/product.stock.reservation.entity';
import { ProductMicroService } from '@app/common';
import { ProductEntity } from '../../src/entities/product.entity';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { StockReservationStatus } from '@app/common/grpc/proto/product';

const stock: ProductStockEntity = {
    id: 1,
    productId: 1,
    quantity: 1000,
    product: null,
};

const stockReservation: ProductStockReservationEntity = {
    id: 1,
    orderId: '1',
    product: {
        id: 1,
        name: '',
        description: '',
        price: 0,
        category: null,
        images: [],
        stock: stock,
        createdAt: undefined,
        updatedAt: undefined,
    },
    reservedQty: 100,
    expiresAt: new Date(),
    status: StockReservationStatus.PENDING,
    createdAt: undefined,
};

const product: ProductEntity = {
    id: 1,
    name: 'product',
    description: 'product',
    price: 1000,
    category: null,
    images: [],
    stock: stock,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('StockService', () => {
    let stockService: StockService;
    let mockDataSource: jest.Mocked<DataSource>;
    let mockQueryRunner: jest.Mocked<QueryRunner>;
    let mockProductService: jest.Mocked<ProductService>;

    let mockStockRepo: jest.Mocked<Repository<ProductStockEntity>>;
    let mockStockReservationRepo: jest.Mocked<Repository<ProductStockReservationEntity>>;

    beforeEach(() => {
        const { unit, unitRef } = TestBed.create(StockService).compile();

        stockService = unit;

        mockDataSource = unitRef.get(getDataSourceToken() as string);
        mockProductService = unitRef.get(ProductService);

        mockStockRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            upsert: jest.fn(),
            increment: jest.fn(),
        } as unknown as jest.Mocked<Repository<ProductStockEntity>>;

        mockStockReservationRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
        } as unknown as jest.Mocked<Repository<ProductStockReservationEntity>>;

        jest.spyOn(mockDataSource, 'getRepository').mockImplementation(entity => {
            if (entity === ProductStockEntity) return mockStockRepo;
            if (entity === ProductStockReservationEntity) return mockStockReservationRepo;
            return null;
        });

        // qr
        const mockQrManager = {
            getRepository: jest.fn().mockImplementation(entity => {
                if (entity === ProductStockEntity) return mockStockRepo;
                if (entity === ProductStockReservationEntity) return mockStockReservationRepo;
                return null;
            }),
        };

        mockQueryRunner = {
            connect: jest.fn().mockResolvedValue(undefined),
            commitTransaction: jest.fn().mockResolvedValue(undefined),
            rollbackTransaction: jest.fn().mockResolvedValue(undefined),
            release: jest.fn().mockResolvedValue(undefined),
            startTransaction: jest.fn().mockResolvedValue(undefined),
            manager: mockQrManager,
        } as unknown as jest.Mocked<QueryRunner>;

        jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);
    });

    describe('getStockByProductId', () => {
        it('should return a stock by product id', async () => {
            const request: ProductMicroService.GetStockByProductIdRequest = {
                productId: 1,
            };

            // mock
            jest.spyOn(mockStockRepo, 'findOne').mockResolvedValue(stock);

            const result = await stockService.getStockByProductId(request.productId);

            // expect
            expect(mockStockRepo.findOne).toHaveBeenCalledWith({
                where: {
                    product: {
                        id: request.productId,
                    },
                },
                relations: ['product'],
            });
            expect(result).toEqual(stock);
        });
    });

    describe('upsertStock', () => {
        const request: ProductMicroService.UpsertStockQuantityRequest = {
            productId: 1,
            quantity: 100,
        };

        it('should upsert a stock', async () => {
            jest.spyOn(mockProductService, 'getProductById').mockResolvedValue(product);
            jest.spyOn(stockService, 'getStockByProductId').mockResolvedValue(stock);

            const result = await stockService.upsertStock(request);

            expect(mockProductService.getProductById).toHaveBeenCalledWith({ id: request.productId });
            expect(mockStockRepo.upsert).toHaveBeenCalledWith(
                {
                    product: product,
                    quantity: request.quantity,
                },
                {
                    conflictPaths: ['product'],
                    skipUpdateIfNoValuesChanged: true,
                },
            );
            expect(stockService.getStockByProductId).toHaveBeenCalledWith(request.productId);
            expect(result).toEqual(stock);
        });

        it('should throw an error if the product is not found', async () => {
            jest.spyOn(mockProductService, 'getProductById').mockResolvedValue(null);

            await expect(stockService.upsertStock(request)).rejects.toThrow(GrpcNotFoundException);
        });
    });

    describe('getStockReservationsByOrderId', () => {
        const request = { orderId: '1' };

        it('should return a stock reservations by order id', async () => {
            jest.spyOn(mockStockReservationRepo, 'find').mockResolvedValue([stockReservation]);

            const result = await stockService.getStockReservationsByOrderId(request.orderId);

            expect(mockStockReservationRepo.find).toHaveBeenCalledWith({
                where: { orderId: request.orderId },
                relations: ['product'],
            });
            expect(result).toEqual([stockReservation]);
        });
    });

    describe('createStockReservation', () => {
        const reservations: ProductMicroService.CreateStockReservation[] = [{ productId: 1, reservedQty: 100 }];

        const request: ProductMicroService.CreateStockReservationRequest = {
            orderId: '1',
            reservations: reservations,
        };

        it('should create a stock reservation', async () => {
            const productIds = reservations.map(reservation => reservation.productId);

            jest.spyOn(mockProductService, 'getProductsByIds').mockResolvedValue({ products: [product], total: 1 });
            jest.spyOn(mockStockRepo, 'find').mockResolvedValue([stock]);
            jest.spyOn(mockStockReservationRepo, 'createQueryBuilder').mockReturnValue({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([{ productId: 1, totalReservedQty: '100' }]),
            } as unknown as SelectQueryBuilder<ProductStockReservationEntity>);
            jest.spyOn(mockStockReservationRepo, 'save').mockResolvedValue(stockReservation);
            jest.spyOn(mockStockReservationRepo, 'find').mockResolvedValue([stockReservation]);

            const result = await stockService.createStockReservation(request);

            expect(mockStockReservationRepo.createQueryBuilder().where).toHaveBeenCalledWith(
                'reservation.productId IN (:...productIds)',
                { productIds: productIds },
            );
            expect(mockStockReservationRepo.createQueryBuilder().andWhere).toHaveBeenCalledWith(
                'reservation.status = :status',
                { status: StockReservationStatus.PENDING },
            );
            expect(mockStockReservationRepo.createQueryBuilder().andWhere).toHaveBeenCalledWith(
                'reservation.expiresAt > :now',
                expect.objectContaining({
                    now: expect.any(Date),
                }),
            );
            expect(mockStockReservationRepo.createQueryBuilder().groupBy).toHaveBeenCalledWith('reservation.productId');
            expect(mockStockReservationRepo.createQueryBuilder().getRawMany).toHaveBeenCalled();
            expect(mockStockReservationRepo.find).toHaveBeenNthCalledWith(1, {
                where: { orderId: request.orderId },
                relations: ['product'],
            });

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
            expect(result).toEqual([stockReservation]);
        });

        it('should throw an error if the product is not found', async () => {
            jest.spyOn(mockProductService, 'getProductsByIds').mockResolvedValue({ products: [], total: 0 });

            await expect(stockService.createStockReservation(request)).rejects.toThrow(GrpcNotFoundException);
        });

        it('should throw an error if the stock is not found', async () => {
            jest.spyOn(mockProductService, 'getProductsByIds').mockResolvedValue({ products: [product], total: 1 });
            jest.spyOn(mockStockReservationRepo, 'createQueryBuilder').mockReturnValue({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([{ productId: 1, totalReservedQty: '10000' }]),
            } as unknown as SelectQueryBuilder<ProductStockReservationEntity>);
            jest.spyOn(mockStockRepo, 'find').mockResolvedValue([]);

            await expect(stockService.createStockReservation(request)).rejects.toThrow(GrpcNotFoundException);
        });

        it('should throw an error if the stock reservation is not found', async () => {
            jest.spyOn(mockProductService, 'getProductsByIds').mockResolvedValue({ products: [product], total: 1 });
            jest.spyOn(mockStockReservationRepo, 'createQueryBuilder').mockReturnValue({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([{ productId: 1, totalReservedQty: '10000' }]),
            } as unknown as SelectQueryBuilder<ProductStockReservationEntity>);
            jest.spyOn(mockStockRepo, 'find').mockResolvedValue([stock]);

            await expect(stockService.createStockReservation(request)).rejects.toThrow(GrpcNotFoundException);
        });
    });

    describe('confirmStockReservation', () => {
        const request: ProductMicroService.ConfirmStockReservationRequest = {
            orderId: '1',
        };

        it('should confirm a stock reservation', async () => {
            jest.spyOn(mockStockReservationRepo, 'find').mockResolvedValue([stockReservation]);
            jest.spyOn(mockStockRepo, 'update').mockResolvedValue(undefined);
            jest.spyOn(mockStockReservationRepo, 'update').mockResolvedValue(undefined);
            jest.spyOn(mockStockReservationRepo, 'find').mockResolvedValue([stockReservation]);

            const result = await stockService.confirmStockReservation(request);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
            expect(mockStockReservationRepo.update).toHaveBeenCalledWith(
                { orderId: request.orderId },
                { status: StockReservationStatus.CONFIRMED },
            );
            const updateCall = mockStockRepo.update.mock.calls[0];
            const quantityFn = updateCall[1].quantity as () => string;
            expect(quantityFn()).toBe(`quantity - ${stockReservation.reservedQty}`);
            expect(mockStockRepo.update).toHaveBeenCalledWith(
                expect.objectContaining({ product: { id: stockReservation.product.id } }),
                expect.objectContaining({ quantity: expect.any(Function) }),
            );
            expect(mockStockReservationRepo.find).toHaveBeenCalledWith({ where: { orderId: request.orderId } });
            expect(result).toEqual([stockReservation]);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the stock reservation is not found', async () => {
            jest.spyOn(mockStockReservationRepo, 'find').mockResolvedValue([]);

            await expect(stockService.confirmStockReservation(request)).rejects.toThrow(GrpcNotFoundException);
            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
        });
    });

    describe('restoreStockReservation', () => {
        const request: ProductMicroService.RestoreStockReservationRequest = {
            orderId: '1',
        };

        it('should restore a stock reservation', async () => {
            jest.spyOn(mockStockReservationRepo, 'find').mockResolvedValue([stockReservation]);
            jest.spyOn(mockStockReservationRepo, 'update').mockResolvedValue(undefined);
            jest.spyOn(mockStockRepo, 'increment').mockResolvedValue(undefined);
            jest.spyOn(mockStockReservationRepo, 'find').mockResolvedValue([stockReservation]);

            const result = await stockService.restoreStockReservation(request);

            expect(mockStockReservationRepo.find).toHaveBeenCalledWith({ where: { orderId: request.orderId } });
            expect(mockStockReservationRepo.update).toHaveBeenCalledWith(
                { orderId: request.orderId },
                { status: StockReservationStatus.RELEASED },
            );
            expect(mockStockRepo.increment).toHaveBeenCalledWith(
                { product: { id: stockReservation.product.id } },
                'quantity',
                stockReservation.reservedQty,
            );
            expect(mockStockReservationRepo.find).toHaveBeenCalledWith({ where: { orderId: request.orderId } });

            expect(result).toEqual([stockReservation]);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the stock reservation is not found', async () => {
            jest.spyOn(mockStockReservationRepo, 'find').mockResolvedValue([]);

            await expect(stockService.restoreStockReservation(request)).rejects.toThrow(GrpcNotFoundException);
        });
    });
});
