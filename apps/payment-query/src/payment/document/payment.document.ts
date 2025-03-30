import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

enum PaymentStatus {
    pending = 'Pending',
    rejected = 'Rejected',
    approved = 'Approved',
}

@Schema()
export class PaymentDocument extends Document<ObjectId> {
    @Prop({ required: true })
    userEmail: string;

    @Prop({ required: true })
    amount: number;

    @Prop({
        required: true,
        type: String,
        enum: PaymentStatus,
        default: PaymentStatus.pending,
    })
    paymentStatus: PaymentStatus;

    @Prop({ required: true })
    cardNumberLastFourDigits: string;

    @Prop({ required: true })
    orderId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(PaymentDocument);
