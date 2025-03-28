import { InjectModel } from '@nestjs/mongoose';
import { PaymentModel } from '../../../domain/payment.model';
import { DatabaseOutputPort } from '../../../port/output/database.output.port';
import { PaymentDocument } from './entity/payment.document';
import { Model } from 'mongoose';
import { PaymentDocumentMapper } from './mapper/payment.document.mapper';

export class MongooseAdapter implements DatabaseOutputPort {
    constructor(
        @InjectModel(PaymentDocument.name)
        private readonly paymentDocument: Model<PaymentDocument>,
    ) {}

    async savePayment(paymentModel: PaymentModel): Promise<PaymentModel> {
        const payment = await this.paymentDocument.create(paymentModel);
        return new PaymentDocumentMapper(payment).toDomain();
    }

    async updatePayment(paymentModel: PaymentModel): Promise<PaymentModel> {
        const payment = await this.paymentDocument.findByIdAndUpdate(
            paymentModel.id,
            paymentModel,
            { new: true },
        );
        return new PaymentDocumentMapper(payment).toDomain();
    }
}
