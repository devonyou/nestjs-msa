import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './adapter/repository/entity/product.entity';
import { ProductController } from './adapter/controller/product.controller';
import { CreateSampleProductUsecase } from './usecase/create.sample.product.usecase';
import { FindProductUsecase } from './usecase/find.product.usecase';
import { ProductRepositoryAdapter } from './adapter/repository/product.repository.adapter';

@Module({
    imports: [TypeOrmModule.forFeature([ProductEntity])],
    controllers: [ProductController],
    providers: [
        CreateSampleProductUsecase,
        FindProductUsecase,

        {
            provide: 'ProductRepositoryPort',
            useClass: ProductRepositoryAdapter,
        },
    ],
})
export class ProductModule {}
