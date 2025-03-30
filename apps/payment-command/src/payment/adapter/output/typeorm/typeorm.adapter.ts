import { PaymentModel } from '../../../domain/payment.model';
import { DatabaseOutputPort } from './../../../port/output/database.output.port';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { PaymentEntityMapper } from './mapper/payment.entity.mapper';

export class TypeormAdapter implements DatabaseOutputPort {
    constructor(
        @InjectRepository(PaymentEntity)
        private readonly paymentRepository: Repository<PaymentEntity>,
    ) {}

    async savePayment(paymentModel: PaymentModel): Promise<PaymentModel> {
        const result = await this.paymentRepository.save(paymentModel);
        return new PaymentEntityMapper(result).toDomain();
    }

    async updatePayment(paymentModel: PaymentModel): Promise<PaymentModel> {
        await this.paymentRepository.update(paymentModel.id, paymentModel);

        const result = await this.paymentRepository.findOne({
            where: { id: paymentModel.id },
        });

        return new PaymentEntityMapper(result).toDomain();
    }
}
