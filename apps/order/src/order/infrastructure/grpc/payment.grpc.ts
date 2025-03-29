import { PAYMENT_SERVICE, PaymentMicroService } from '@app/common';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PaymentDto } from '../../usecase/dto/create.order.dto';
import { PaymentOutputPort } from '../../port/output/payment.output.port';
import { OrderEntity, OrderStatus } from '../../domain/order.entity';
import { OrderEntityMapper } from './mapper/order.entity.mapper.ts';
import { PaymentResponseMapper } from './mapper/payment.response.mapper';
import { PaymentFailedException } from '../framework/exception/payment.failed.exception';

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
        order: OrderEntity,
        payment: PaymentDto,
    ): Promise<OrderEntity> {
        const resp = await lastValueFrom(
            this.paymentService.createPayment(
                new OrderEntityMapper(order).toMakePaymentRequest(payment),
            ),
        );

        const isPaid = resp.paymentStatus === 'Approved';
        const orderStatus = isPaid
            ? OrderStatus.paymentProcessed
            : OrderStatus.paymentFailed;
        if (orderStatus === OrderStatus.paymentFailed)
            throw new PaymentFailedException(resp);

        return new PaymentResponseMapper(resp).toDomain(order, payment);
    }
}
