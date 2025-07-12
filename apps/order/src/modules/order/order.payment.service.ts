import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { createGrpcMetadata, PaymentMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { OrderService } from './order.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderPaymentService implements OnModuleInit {
    private paymentService: PaymentMicroService.PaymentServiceClient;

    constructor(
        @Inject(PaymentMicroService.PAYMENT_SERVICE_NAME)
        private readonly paymentMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.paymentService = this.paymentMicroService.getService<PaymentMicroService.PaymentServiceClient>(
            PaymentMicroService.PAYMENT_SERVICE_NAME,
        );
    }

    /**
     * 결제 생성(주문 생성 시)
     * @param request
     * @returns
     */
    async createPayment(
        request: PaymentMicroService.CreatePaymentRequest,
    ): Promise<PaymentMicroService.PaymentResponse> {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.createPayment.name);
            const stream = this.paymentService.createPayment(request, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '결제 정보를 찾을 수 없습니다');
        }
    }

    /**
     * 결제 상태 업데이트(확정)
     * @param request
     * @returns
     */
    async confirmPayment(
        request: PaymentMicroService.ConfirmPaymentRequest,
    ): Promise<PaymentMicroService.PaymentResponse> {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.confirmPayment.name);
            const stream = this.paymentService.confirmPayment(request, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '결제 정보를 찾을 수 없습니다');
        }
    }

    /**
     * 결제 상태 업데이트(취소)
     * @param request
     * @returns
     */
    async cancelPayment(
        request: PaymentMicroService.CancelPaymentRequest,
    ): Promise<PaymentMicroService.PaymentResponse> {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.cancelPayment.name);
            const stream = this.paymentService.cancelPayment(request, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '결제 정보를 찾을 수 없습니다');
        }
    }

    /**
     * 결제 상태 업데이트(실패)
     * @param request
     * @returns
     */
    async failPayment(request: PaymentMicroService.FailPaymentRequest): Promise<PaymentMicroService.PaymentResponse> {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.failPayment.name);
            const stream = this.paymentService.failPayment(request, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message ?? '결제 정보를 찾을 수 없습니다');
        }
    }
}
