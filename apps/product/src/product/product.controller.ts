import { Controller, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { GrpcInterceptor, ProductMicroService } from '@app/common';

@Controller('product')
@ProductMicroService.ProductServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class ProductController implements ProductMicroService.ProductServiceController {
    constructor(private readonly productService: ProductService) {}

    // @Post('sample')
    // createSample() {
    //     return this.productService.createSampleProduct();
    // }

    // @MessagePattern({ cmd: 'get-products-info' })
    // @UsePipes(ValidationPipe)
    // @UseInterceptors(RpcInterceptor)
    async getProductsInfo(req: ProductMicroService.GetProductsInfoRequest) {
        const { productIds } = req;
        return {
            products: await this.productService.getProductsInfo(productIds),
        };
    }

    // @MessagePattern({ cmd: 'create-sample' })
    // @UsePipes(ValidationPipe)
    // @UseInterceptors(RpcInterceptor)
    async createSample() {
        return {
            success: await this.productService.createSampleProduct(),
        };
    }
}
