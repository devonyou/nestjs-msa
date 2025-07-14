import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class OrderNotificationService {
    constructor(@Inject('MAIL_RMQ') private readonly mailRmqClient: ClientProxy) {}

    async sendOrderConfirmationEmail(request: NotificationMicroService.OrderConfirmationRequest) {
        try {
            this.mailRmqClient.emit<NotificationMicroService.SendEmailResponse>('sendOrderConfirmationEmail', request);
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '메일을 보낼 수 없습니다');
        }
    }
}
