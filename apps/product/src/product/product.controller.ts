import { Controller, Post, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { GetProductInfoDto } from './dto/get.product.info.dto';
import { RpcInterceptor } from '@app/common/interceptor';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    // @Post('sample')
    // createSample() {
    //     return this.productService.createSampleProduct();
    // }

    @MessagePattern({ cmd: 'get-products-info' }, Transport.TCP)
    @UsePipes(ValidationPipe)
    @UseInterceptors(RpcInterceptor)
    getProductsInfo(@Payload() dto: GetProductInfoDto) {
        const { productIds } = dto;
        return this.productService.getProductsInfo(productIds);
    }

    @MessagePattern({ cmd: 'create-sample' }, Transport.TCP)
    @UsePipes(ValidationPipe)
    @UseInterceptors(RpcInterceptor)
    createSample() {
        return this.productService.createSampleProduct();
    }
}
