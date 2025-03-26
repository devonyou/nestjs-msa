import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send.payment.notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationStatus } from './entity/notification.entity';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE, OrderMicroService } from '@app/common';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class NotificationService implements OnModuleInit {
    private orderService: OrderMicroService.OrderServiceClient;

    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
        @Inject(ORDER_SERVICE) private readonly OrderMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.orderService = this.OrderMicroService.getService('OrderService');
    }

    async sendPaymentNotification(dto: SendPaymentNotificationDto, metadata: Metadata) {
        const { to, orderId } = dto;
        const notification = await this.createNotification(to);

        await this.sendEmail();

        await this.updateNotificationStatus(notification._id.toString(), NotificationStatus.sent);

        this.sendDeliveryStartedMessage(orderId, metadata);

        return await this.notificationModel.findById(notification._id);
    }

    async createNotification(to: string) {
        return await this.notificationModel.create({
            from: 'onyou.code@gmail.com',
            to: to,
            subject: '배송이 시작되었습니다.',
            content: `${to}님! 주문하신 물건의 배송이 시작되었습니다.`,
        });
    }

    async sendEmail() {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async updateNotificationStatus(id: string, status: NotificationStatus) {
        return this.notificationModel.findByIdAndUpdate(id, { status });
    }

    sendDeliveryStartedMessage(id: string, metadata: Metadata) {
        this.orderService.deliveryStarted({ id }, metadata);
    }
}
