import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { createGrpcMetadata, ProductMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { lastValueFrom } from 'rxjs';
import { OrderService } from './order.service';

@Injectable()
export class OrderProductService implements OnModuleInit {
    private productService: ProductMicroService.ProductServiceClient;

    constructor(
        @Inject(ProductMicroService.PRODUCT_SERVICE_NAME)
        private readonly productMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.productService = this.productMicroService.getService<ProductMicroService.ProductServiceClient>(
            ProductMicroService.PRODUCT_SERVICE_NAME,
        );
    }

    /**
     * 상품 조회
     * @param ids 상품 ID 배열
     * @returns ProductMicroService.ProductListResponse
     */
    async getProductsByIds(ids: number[]): Promise<ProductMicroService.ProductListResponse> {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.getProductsByIds.name);
            const stream = this.productService.getProductsByIds({ ids }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '상품을 찾을 수 없습니다');
        }
    }

    /**
     * 재고 예약
     * @param request ProductMicroService.CreateStockReservationRequest
     * @returns ProductMicroService.StockReservationListResponse
     */
    async createStockReservation(request: ProductMicroService.CreateStockReservationRequest) {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.createStockReservation.name);
            const stream = this.productService.createStockReservation(request, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '재고 예약이 불가능 합니다.');
        }
    }

    /**
     * 재고 차감
     * @param request ProductMicroService.ConfirmStockReservationRequest
     * @returns ProductMicroService.StockResponse
     */
    async confirmStockReservation(request: ProductMicroService.ConfirmStockReservationRequest) {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.confirmStockReservation.name);
            const stream = this.productService.confirmStockReservation(request, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '재고 차감이 불가능 합니다.');
        }
    }

    /**
     * 재고 예약 복구
     * @param request ProductMicroService.RestoreStockReservationRequest
     * @returns ProductMicroService.StockReservationListResponse
     */
    async restoreStockReservation(request: ProductMicroService.RestoreStockReservationRequest) {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.restoreStockReservation.name);
            const stream = this.productService.restoreStockReservation(request, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '재고 예약 복구가 불가능 합니다.');
        }
    }
}
