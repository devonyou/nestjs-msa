import { Controller, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GrpcInterceptor, NotificationMicroService } from '@app/common';
import { Metadata } from '@grpc/grpc-js';

@Controller('notification')
@NotificationMicroService.NotificationServiceControllerMethods()
export class NotificationController
    implements NotificationMicroService.NotificationServiceController
{
    constructor(private readonly notificationService: NotificationService) {}

    @UseInterceptors(GrpcInterceptor)
    async sendPaymentNotification(
        req: NotificationMicroService.SendPaymentNotificationRequest,
        metadata: Metadata,
    ) {
        const response = (
            await this.notificationService.sendPaymentNotification(
                req,
                metadata,
            )
        ).toJSON();

        return {
            ...response,
            status: response.status.toString(),
        };
    }
}
