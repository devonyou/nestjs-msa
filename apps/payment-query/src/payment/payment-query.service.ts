import { Injectable } from '@nestjs/common';
import { PaymentDocument } from './document/payment.document';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PaymentQueryService {
    constructor(
        @InjectModel(PaymentDocument.name)
        private readonly paymentRepository: Model<PaymentDocument>,
    ) {}

    saveDocument(payload: PaymentDocument) {
        return this.paymentRepository.create(payload);
    }

    updateDocument(payload: PaymentDocument) {
        const { _id, orderId, ...rest } = payload;
        return this.paymentRepository.findOneAndUpdate({ orderId }, rest);
    }
}
