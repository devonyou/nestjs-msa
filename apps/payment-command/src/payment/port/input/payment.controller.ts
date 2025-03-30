import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcInterceptor, PaymentMicroService } from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import { PaymentService } from '../../application/payment.service';
import { PaymentMethod } from '../../domain/payment.model';

@Controller('payment')
@PaymentMicroService.PaymentServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class PaymentController
    implements PaymentMicroService.PaymentServiceController
{
    constructor(private readonly paymentService: PaymentService) {}

    async createPayment(req: PaymentMicroService.CreatePaymentRequest) {
        return await this.paymentService.createPayment({
            ...req,
            paymentMethod: req.paymentMethod as PaymentMethod,
        });
    }
}
