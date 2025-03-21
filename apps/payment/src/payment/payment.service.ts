import { Inject, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create.payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entity/payment.entity';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_SERVICE } from '@app/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
        @Inject(NOTIFICATION_SERVICE) private readonly notifictaionService: ClientProxy,
    ) {}

    async createPayment(dto: CreatePaymentDto) {
        const { orderId, userEmail } = dto;
        let paymentId;
        try {
            const result = await this.paymentRepository.save(dto);
            paymentId = result.id;
            await this.processPayment();
            await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

            // notification
            this.sendNotification(orderId, userEmail);

            return this.paymentRepository.findOne({ where: { id: paymentId } });
        } catch (err) {
            if (paymentId) {
                await this.updatePaymentStatus(paymentId, PaymentStatus.rejected);
            }
        }
    }

    async processPayment() {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async updatePaymentStatus(id: string, status: PaymentStatus) {
        await this.paymentRepository.update({ id }, { paymentStatus: status });
    }

    async sendNotification(orderId: string, userEmail: string) {
        const resp = await lastValueFrom(
            this.notifictaionService.send(
                { cmd: 'send-payment-notification' },
                {
                    orderId,
                    to: userEmail,
                },
            ),
        );
        return resp;
    }
}
