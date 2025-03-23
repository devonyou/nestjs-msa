import { Controller, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common/interceptor';
import { SendPaymentNotificationDto } from './dto/send.payment.notification.dto';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @MessagePattern({ cmd: 'send-payment-notification' })
    @UsePipes(ValidationPipe)
    @UseInterceptors(RpcInterceptor)
    sendPaymentNotification(@Payload() dto: SendPaymentNotificationDto) {
        return this.notificationService.sendPaymentNotification(dto);
    }
}
