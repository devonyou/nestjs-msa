import { Controller } from '@nestjs/common';
import { NotificationMicroService } from '@app/common';
import { Ctx, EventPattern } from '@nestjs/microservices';
import { RmqContext } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';
import { MailService } from './mail.service';

@Controller()
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @EventPattern('sendOrderConfirmationEmail')
    processOrderConfirmationEmail(
        @Payload() request: NotificationMicroService.OrderConfirmationRequest,
        @Ctx() context: RmqContext,
    ) {
        this.mailService.processOrderConfirmationEmail(request, context);
    }
}
