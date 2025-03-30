import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './adapter/controller/order.controller';
import { CreateOrderUsecase } from './usecase/create.order.usecase';
import {
    OrderDocument,
    OrderSchema,
} from './adapter/mongoose/document/order.document';
import { CustomerGrpc } from './adapter/grpc/customer.grpc';
import { ProductGrpc } from './adapter/grpc/product.grpc';
import { PaymentGrpc } from './adapter/grpc/payment.grpc';
import { OrderRepository } from './adapter/mongoose/order.repository';
import { StartDeliveryUsecase } from './usecase/delivery.started.usecase';
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
        { provide: 'OrderOutputPort', useClass: OrderRepository },
        { provide: 'CustomerOutputPort', useClass: CustomerGrpc },
        { provide: 'ProductOutputPort', useClass: ProductGrpc },
        { provide: 'PaymentOutputPort', useClass: PaymentGrpc },
    ],
})
export class OrderModule {}
