import { Controller } from '@nestjs/common';
import { StockService } from './stock.service';
import { ProductMicroService } from '@app/common';
import { GrpcMethod } from '@nestjs/microservices';
import { StockResponseMapper } from './mapper/stock.response.mapper';
import { StockReservationResponseMapper } from './mapper/stock.reservation.response.mapper';

@Controller('stock')
export class StockController
    implements
        Pick<
            ProductMicroService.ProductServiceController,
            | 'getStockByProductId'
            | 'upsertStock'
            | 'createStockReservation'
            | 'confirmStockReservation'
            | 'restoreStockReservation'
        >
{
    constructor(private readonly stockService: StockService) {}

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'getStockByProductId')
    async getStockByProductId(
        request: ProductMicroService.GetStockByProductIdRequest,
    ): Promise<ProductMicroService.StockResponse> {
        const stock = await this.stockService.getStockByProductId(request.productId);
        return StockResponseMapper.toStockResponse(stock);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'upsertStock')
    async upsertStock(
        request: ProductMicroService.UpsertStockQuantityRequest,
    ): Promise<ProductMicroService.StockResponse> {
        const stock = await this.stockService.upsertStock(request);
        return StockResponseMapper.toStockResponse(stock);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'createStockReservation')
    async createStockReservation(
        request: ProductMicroService.CreateStockReservationRequest,
    ): Promise<ProductMicroService.StockReservationListResponse> {
        const reservation = await this.stockService.createStockReservation(request);

        return {
            reservations: reservation.map(reservation =>
                StockReservationResponseMapper.toStockReservationResponse(reservation),
            ),
        };
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'confirmStockReservation')
    async confirmStockReservation(
        request: ProductMicroService.ConfirmStockReservationRequest,
    ): Promise<ProductMicroService.StockReservationListResponse> {
        const reservations = await this.stockService.confirmStockReservation(request);
        return {
            reservations: reservations.map(reservation =>
                StockReservationResponseMapper.toStockReservationResponse(reservation),
            ),
        };
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'restoreStockReservation')
    async restoreStockReservation(
        request: ProductMicroService.RestoreStockReservationRequest,
    ): Promise<ProductMicroService.StockReservationListResponse> {
        const reservations = await this.stockService.restoreStockReservation(request);
        return {
            reservations: reservations.map(reservation =>
                StockReservationResponseMapper.toStockReservationResponse(reservation),
            ),
        };
    }
}
