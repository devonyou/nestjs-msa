import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.entity';
import { Customer, CustomerSchema } from './customer.entity';
import { Product, ProductSchema } from './product.entity';
import { DeliveryAddress, DeliveryAddressSchema } from './delivery.address.entity';
import { Document, ObjectId } from 'mongoose';

export enum OrderStatus {
    pending = 'Pending',
    paymentCanceled = 'PaymentCanceled',
    paymentFailed = 'PaymentFailed',
    paymentProcessed = 'PaymentProcessed',
    deliveryStarted = 'DeliveryStarted',
    deliveryDone = 'DeliveryDone',
}

@Schema()
export class Order extends Document<ObjectId> {
    @Prop({ required: true, type: CustomerSchema })
    customer: Customer;

    @Prop({ required: true, type: [ProductSchema] })
    products: Product[];

    @Prop({ required: true, type: DeliveryAddressSchema })
    deliveryAddress: DeliveryAddress;

    @Prop({ enum: OrderStatus, default: OrderStatus.pending })
    status: OrderStatus;

    @Prop({ required: true, type: PaymentSchema })
    payment: Payment;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
