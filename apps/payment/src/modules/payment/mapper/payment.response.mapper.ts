import { PaymentMicroService } from '@app/common';
import { PaymentEntity } from '../../../entities/payment.entity';

export class PaymentResponseMapper {
    static toResponse(payment: PaymentEntity): PaymentMicroService.PaymentResponse {
        return {
            id: payment.id,
            orderId: payment.orderId,
            userId: payment.userId,
            amount: payment.amount,
            status: payment.status,
            provider: payment.provider,
            providerPaymentId: payment.providerPaymentId,
            createdAt: payment.createdAt && new Date(payment.createdAt).toISOString(),
            updatedAt: payment.updatedAt && new Date(payment.updatedAt).toISOString(),
        };
    }
}
