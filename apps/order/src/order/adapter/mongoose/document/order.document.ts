import { Document, ObjectId } from 'mongoose';
import { CustomerDocument, CustomerSchema } from './customer.document';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProductDocument, ProductSchema } from './product.document';
import {
    DeliveryAddressDocument,
    DeliveryAddressSchema,
} from './delivery.address.document';
import { PaymentDocument, PaymentSchema } from './payment.document';

export enum OrderStatus {
    pending = 'Pending',
    paymentCanceled = 'PaymentCanceled',
    paymentFailed = 'PaymentFailed',
    paymentProcessed = 'PaymentProcessed',
    deliveryStarted = 'DeliveryStarted',
    deliveryDone = 'DeliveryDone',
}

@Schema()
export class OrderDocument extends Document<ObjectId> {
    @Prop({ required: true, type: CustomerSchema })
    customer: CustomerDocument;

    @Prop({ required: true, type: [ProductSchema] })
    products: ProductDocument[];

    @Prop({ required: true, type: DeliveryAddressSchema })
    deliveryAddress: DeliveryAddressDocument;

    @Prop({ type: String, enum: OrderStatus, default: OrderStatus.pending })
    status: OrderStatus;

    @Prop({ type: PaymentSchema })
    payment: PaymentDocument;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDocument);
