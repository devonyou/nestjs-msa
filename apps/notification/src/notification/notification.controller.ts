import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationMicroService } from '@app/common';

@Controller('notification')
@NotificationMicroService.NotificationServiceControllerMethods()
export class NotificationController implements NotificationMicroService.NotificationServiceController {
    constructor(private readonly notificationService: NotificationService) {}

    async sendPaymentNotification(req: NotificationMicroService.SendPaymentNotificationRequest) {
        const response = (await this.notificationService.sendPaymentNotification(req)).toJSON();

        return {
            ...response,
            status: response.status.toString(),
        };
    }
}
