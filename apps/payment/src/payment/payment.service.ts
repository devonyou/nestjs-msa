import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create.payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entity/payment.entity';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { constructorMetadata, NOTIFICATION_SERVICE, NotificationMicroService } from '@app/common';
import { lastValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class PaymentService implements OnModuleInit {
    private notificationService: NotificationMicroService.NotificationServiceClient;

    constructor(
        @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
        // @Inject(NOTIFICATION_SERVICE) private readonly notifictaionService: ClientProxy,
        @Inject(NOTIFICATION_SERVICE) private readonly notificationMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.notificationService = this.notificationMicroService.getService('NotificationService');
    }

    async createPayment(dto: CreatePaymentDto, metadata: Metadata) {
        const { orderId, userEmail } = dto;
        let paymentId;
        try {
            const result = await this.paymentRepository.save(dto);
            paymentId = result.id;
            await this.processPayment();
            await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

            // notification
            this.sendNotification(orderId, userEmail, metadata);

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

    async sendNotification(orderId: string, userEmail: string, metadata: Metadata) {
        const resp = await lastValueFrom(
            this.notificationService.sendPaymentNotification(
                {
                    orderId,
                    to: userEmail,
                },
                constructorMetadata(PaymentService.name, 'sendNotification', metadata),
            ),
        );
        return resp;
    }
}
