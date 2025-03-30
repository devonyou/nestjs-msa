import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './infrastructure/framework/order.controller';
import { UserGrpc } from './infrastructure/grpc/user.grpc';
import { CreateOrderUsecase } from './usecase/create.order.usecase';
import { StartDeliveryUsecase } from './usecase/start.delivery.usecase';
import {
    OrderDocument,
    OrderSchema,
} from './infrastructure/mongoose/entity/order.entity';
import { OrderRepository } from './infrastructure/mongoose/repository/order.repository';
import { PaymentGrpc } from './infrastructure/grpc/payment.grpc';
import { ProductGrpc } from './infrastructure/grpc/product.grpc';
import { CancelOrderUsecase } from './usecase/cancel.order.usecase';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: OrderDocument.name, schema: OrderSchema },
        ]),
    ],
    controllers: [OrderController],
    providers: [
        CreateOrderUsecase,
        StartDeliveryUsecase,
        CancelOrderUsecase,

        { provide: 'UserOutputPort', useClass: UserGrpc },
        { provide: 'PaymentOutputPort', useClass: PaymentGrpc },
        { provide: 'ProductOutputPort', useClass: ProductGrpc },
        { provide: 'OrderOutputPort', useClass: OrderRepository },
    ],
})
export class OrderModule {}
