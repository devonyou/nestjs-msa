import { GrpcInterceptor, ProductMicroService } from '@app/common';
import {
    CreateSampleRequest,
    CreateSampleResponse,
    GetProductsAllRequest,
    GetProductsAllResponse,
    GetProductsInfoRequest,
    GetProductsInfoResponse,
    ProductServiceController,
} from '@app/common/grpc/proto/product';
import { Controller, UseInterceptors } from '@nestjs/common';
import { CreateSampleProductUsecase } from '../../usecase/create.sample.product.usecase';
import { FindProductUsecase } from './../../usecase/find.product.usecase';

@Controller()
@ProductMicroService.ProductServiceControllerMethods()
export class ProductController implements ProductServiceController {
    constructor(
        private readonly createSampleProductUsecase: CreateSampleProductUsecase,
        private readonly findProductUsecase: FindProductUsecase,
    ) {}

    @UseInterceptors(GrpcInterceptor)
    async createSample(
        request: CreateSampleRequest,
    ): Promise<CreateSampleResponse> {
        await this.createSampleProductUsecase.execute();
        return {
            success: true,
        };
    }

    @UseInterceptors(GrpcInterceptor)
    async getProductsInfo(
        request: GetProductsInfoRequest,
    ): Promise<GetProductsInfoResponse> {
        const { productIds } = request;
        const products =
            await this.findProductUsecase.findManyProductByIds(productIds);
        return {
            products,
        };
    }

    async getProductsAll(
        request: GetProductsAllRequest,
    ): Promise<GetProductsAllResponse> {
        const products = await this.findProductUsecase.findAllProduct();
        return { products };
    }
}
