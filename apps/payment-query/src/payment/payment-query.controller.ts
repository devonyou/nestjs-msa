import { Controller } from '@nestjs/common';
import { PaymentQueryService } from './payment-query.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentDocument } from './document/payment.document';

@Controller()
export class PaymentQueryController {
    constructor(private readonly paymentQueryService: PaymentQueryService) {}

    @EventPattern('payment.created')
    async paymentCreated(@Payload() payload: PaymentDocument) {
        await this.paymentQueryService.saveDocument(payload);
    }

    @EventPattern('payment.updated')
    async paymentUpdated(@Payload() payload: PaymentDocument) {
        await this.paymentQueryService.updateDocument(payload);
    }
}
