import { NotificationMicroService } from '@app/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) {}

    async processOrderConfirmationEmail(
        request: NotificationMicroService.OrderConfirmationRequest,
        context: RmqContext,
    ) {
        const { to, userName, orderId, orderDate, totalAmount, items } = request;

        // rmq
        const channel = context.getChannelRef();
        const message = context.getMessage();

        try {
            await this.mailerService.sendMail({
                to: to,
                subject: `[주문완료] 주문번호 ${orderId}`,
                template: 'order.confirmation.hbs',
                context: {
                    userName: userName,
                    orderId: orderId,
                    orderDate: orderDate,
                    totalAmount: totalAmount,
                    items: items,
                },
            });

            this.logger.log(`[Mail] Mail sent to ${to}`);

            return { success: true, message: 'Mail sent' };
        } catch (err) {
            this.logger.error(`[Mail] Failed to send mail to ${to}: ${err}`);
            return { success: false, message: 'Failed to send mail' };
        } finally {
            channel.ack(message);
        }
    }
}
