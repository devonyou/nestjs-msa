import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMicroService } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';

@Controller('payment')
@PaymentMicroService.PaymentServiceControllerMethods()
export class PaymentController implements PaymentMicroService.PaymentServiceController {
    constructor(private readonly paymentService: PaymentService) {}

    async createPayment(req: PaymentMicroService.CreatePaymentRequest) {
        return await this.paymentService.createPayment({
            ...req,
            paymentMethod: req.paymentMethod as PaymentMethod,
        });
    }
}
