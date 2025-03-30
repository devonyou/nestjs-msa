import { InjectModel } from '@nestjs/mongoose';
import { PaymentModel } from '../../../domain/payment.model';
import { DatabaseOutputPort } from '../../../port/output/database.output.port';
import { PaymentDocument } from './entity/payment.document';
import { Model } from 'mongoose';
import { Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentDocumentMapper } from './mapper/payment.document.mapper';

export class MongooseAdapter
    implements DatabaseOutputPort, OnModuleInit, OnModuleDestroy
{
    constructor(
        @InjectModel(PaymentDocument.name)
        private readonly paymentDocument: Model<PaymentDocument>,
        @Inject('KAFKA_SERVICE') private readonly kafkaService: ClientKafka,
    ) {}

    async onModuleInit() {
        await this.kafkaService.connect();
    }

    async onModuleDestroy() {
        await this.kafkaService.close();
    }

    async savePayment(paymentModel: PaymentModel): Promise<PaymentModel> {
        const payment = await this.paymentDocument.create(paymentModel);
        const mapper = new PaymentDocumentMapper(payment);

        this.kafkaService.emit(
            'payment.created',
            mapper.toPaymentQueryMicroservicePayload(),
        );
        return mapper.toDomain();
    }

    async updatePayment(paymentModel: PaymentModel): Promise<PaymentModel> {
        const payment = await this.paymentDocument.create(paymentModel);

        const mapper = new PaymentDocumentMapper(payment);

        this.kafkaService.emit(
            'payment.updated',
            mapper.toPaymentQueryMicroservicePayload(),
        );

        return mapper.toDomain();
    }
}
