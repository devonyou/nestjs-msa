import { lastValueFrom } from 'rxjs';
import { Inject, OnModuleInit } from '@nestjs/common';
import { PaymentOutputPort } from '../../port/output/payment.output.port';
import { OrderDomain, OrderStatus } from '../../domain/order.domain';
import { PaymentDomain } from '../../domain/payment.domain';
import { PaymentDto } from '../../dto/create.order.dto';
import { PAYMENT_SERVICE, PaymentMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { OrderDomainMapper } from '../../mapper/order.domain.mapper';
import { PaymentFailedException } from '../exception/payment.failed.exception';

export class PaymentGrpc implements PaymentOutputPort, OnModuleInit {
    paymentService: PaymentMicroService.PaymentServiceClient;

    constructor(
        @Inject(PAYMENT_SERVICE)
        private readonly paymentMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.paymentService =
            this.paymentMicroService.getService<PaymentMicroService.PaymentServiceClient>(
                'PaymentService',
            );
    }

    async processPayment(
        orderDomain: OrderDomain,
        paymentDto: PaymentDto,
    ): Promise<PaymentDomain> {
        const mapper = new OrderDomainMapper(orderDomain);

        const resp = await lastValueFrom(
            this.paymentService.createPayment(
                mapper.toCreatePaymentRequest(paymentDto),
            ),
        );

        const isPaid = resp.paymentStatus === 'Approved';
        const orderStatus = isPaid
            ? OrderStatus.paymentProcessed
            : OrderStatus.paymentFailed;
        if (orderStatus === OrderStatus.paymentFailed)
            throw new PaymentFailedException(resp);

        return {
            paymentId: resp.id,
            amount: paymentDto.amount,
            paymentMethod: paymentDto.paymentMethod,
            paymentName: paymentDto.paymentName,
        };
    }
}
