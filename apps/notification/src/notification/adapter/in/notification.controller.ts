import { SendNotificationUsecase } from './../../usecase/send.notification.usecase';
import {
    NotificationServiceController,
    NotificationServiceControllerMethods,
    SendPaymentNotificationRequest,
    SendPaymentNotificationResponse,
} from '@app/common/grpc/proto/notification';
import { Controller } from '@nestjs/common';

@Controller()
@NotificationServiceControllerMethods()
export class NotificationController implements NotificationServiceController {
    constructor(
        private readonly sendNotificationUsecase: SendNotificationUsecase,
    ) {}

    async sendPaymentNotification(
        request: SendPaymentNotificationRequest,
    ): Promise<SendPaymentNotificationResponse> {
        const result = await this.sendNotificationUsecase.execute(request);
        return {
            from: null,
            to: null,
            subject: null,
            content: null,
            status: null,
        };
    }
}
