import { Controller, UseInterceptors } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GrpcInterceptor, PaymentMicroService } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';
import { Metadata } from '@grpc/grpc-js';

@Controller('payment')
@PaymentMicroService.PaymentServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class PaymentController implements PaymentMicroService.PaymentServiceController {
    constructor(private readonly paymentService: PaymentService) {}

    async createPayment(req: PaymentMicroService.CreatePaymentRequest, metadata: Metadata) {
        return await this.paymentService.createPayment(
            {
                ...req,
                paymentMethod: req.paymentMethod as PaymentMethod,
            },
            metadata,
        );
    }
}
