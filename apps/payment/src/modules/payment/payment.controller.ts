import { PaymentMicroService } from '@app/common';
import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResponseMapper } from './mapper/payment.response.mapper';

@Controller()
@PaymentMicroService.PaymentServiceControllerMethods()
export class PaymentController implements PaymentMicroService.PaymentServiceController {
    constructor(private readonly paymentService: PaymentService) {}

    async createPayment(
        request: PaymentMicroService.CreatePaymentRequest,
    ): Promise<PaymentMicroService.PaymentResponse> {
        const result = await this.paymentService.createPayment(request);
        return PaymentResponseMapper.toResponse(result);
    }

    async confirmPayment(
        request: PaymentMicroService.ConfirmPaymentRequest,
    ): Promise<PaymentMicroService.PaymentResponse> {
        const result = await this.paymentService.confirmPayment(request);
        return PaymentResponseMapper.toResponse(result);
    }

    async cancelPayment(
        request: PaymentMicroService.CancelPaymentRequest,
    ): Promise<PaymentMicroService.PaymentResponse> {
        const result = await this.paymentService.cancelPayment(request);
        return PaymentResponseMapper.toResponse(result);
    }

    async failPayment(request: PaymentMicroService.FailPaymentRequest): Promise<PaymentMicroService.PaymentResponse> {
        const result = await this.paymentService.failPayment(request);
        return PaymentResponseMapper.toResponse(result);
    }
}
