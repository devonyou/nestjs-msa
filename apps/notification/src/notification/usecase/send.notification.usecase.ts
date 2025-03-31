import { OrderGrpcOutPort } from './../port/out/order.grpc.out.port';
import { Inject, Injectable } from '@nestjs/common';
import { SendNotificationDto } from '../dto/send.payment.notification.dto';
import { NotificationRepositoryOutPort } from '../port/out/notification.repostiroy.out.port';
import { SendMailOutPort } from '../port/out/send.mail.out.port';
import { NotificationDomain } from '../domain/notification.domain';

@Injectable()
export class SendNotificationUsecase {
    constructor(
        @Inject('NotificationRepositoryOutPort')
        private readonly notificationRepositoryOutPort: NotificationRepositoryOutPort,
        @Inject('SendMailOutPort')
        private readonly sendMailOutPort: SendMailOutPort,
        @Inject('OrderGrpcOutPort')
        private readonly orderGrpcOutPort: OrderGrpcOutPort,
    ) {}

    async execute(dto: SendNotificationDto) {
        const { to, orderId } = dto;

        const notification = new NotificationDomain({
            to,
            subject: `배송이 시작되었습니다.`,
            content: `${to}님! 주문하신 물건의 배송이 시작되었습니다.`,
            from: 'admin@gmail.com',
        });

        notification.pending();

        const notificationEntity =
            await this.notificationRepositoryOutPort.createNotification(
                notification,
            );

        notification.setId(notificationEntity.id);

        try {
            await this.sendMailOutPort.sendMail(notification);

            notification.sent();

            await this.notificationRepositoryOutPort.updateNotification(
                notification,
            );

            await this.orderGrpcOutPort.deliveryStarted(orderId);

            return notification;
        } catch (err) {
            // this.kafkaService.emit('order.notification.fail', orderId);
            return notification;
        }
    }
}
