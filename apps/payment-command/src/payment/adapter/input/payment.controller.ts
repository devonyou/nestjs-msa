import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcInterceptor, PaymentMicroService } from '@app/common';
import { PaymentService } from '../../application/payment.service';
import { PaymentMethod } from '../../domain/payment.model';
import { EventPattern } from '@nestjs/microservices';

@Controller('payment')
@PaymentMicroService.PaymentServiceControllerMethods()
export class PaymentController
    implements PaymentMicroService.PaymentServiceController
{
    constructor(private readonly paymentService: PaymentService) {}

    @UseInterceptors(GrpcInterceptor)
    async createPayment(req: PaymentMicroService.CreatePaymentRequest) {
        return await this.paymentService.createPayment({
            ...req,
            paymentMethod: req.paymentMethod as PaymentMethod,
        });
    }

    @EventPattern('order.notification.fail')
    async orderNotificationFail(orderId: string) {
        await this.paymentService.cancelPayment(orderId);
    }
}
