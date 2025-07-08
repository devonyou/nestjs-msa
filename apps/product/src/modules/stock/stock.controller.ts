import { Controller } from '@nestjs/common';
import { StockService } from './stock.service';
import { ProductMicroService } from '@app/common';
import { GrpcMethod } from '@nestjs/microservices';
import { StockResponseMapper } from './mapper/stock.response.mapper';

@Controller('stock')
export class StockController
    implements Pick<ProductMicroService.ProductServiceController, 'getStockByProductId' | 'upsertStock'>
{
    constructor(private readonly stockService: StockService) {}

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'getStockByProductId')
    async getStockByProductId(
        request: ProductMicroService.GetStockByProductIdRequest,
    ): Promise<ProductMicroService.StockResponse> {
        const stock = await this.stockService.getStockByProductId(request);
        return StockResponseMapper.toStockResponse(stock);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'upsertStock')
    async upsertStock(
        request: ProductMicroService.UpsertStockQuantityRequest,
    ): Promise<ProductMicroService.StockResponse> {
        const stock = await this.stockService.upsertStock(request);
        return StockResponseMapper.toStockResponse(stock);
    }
}
