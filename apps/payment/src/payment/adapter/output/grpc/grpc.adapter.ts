import { Inject, OnModuleInit } from '@nestjs/common';
import { NetworkOutputPort } from '../../../port/output/network.output.port';
import { NOTIFICATION_SERVICE, NotificationMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export class GrpcAdapter implements NetworkOutputPort, OnModuleInit {
    private notificationService: NotificationMicroService.NotificationServiceClient;

    constructor(
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.notificationService = this.notificationMicroService.getService(
            'NotificationService',
        );
    }

    async sendNotification(orderId: string, userEmail: string) {
        await lastValueFrom(
            this.notificationService.sendPaymentNotification({
                to: userEmail,
                orderId: orderId,
            }),
        );
    }
}
