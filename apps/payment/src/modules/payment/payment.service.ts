import {
    CancelPaymentRequest,
    ConfirmPaymentRequest,
    CreatePaymentRequest,
    FailPaymentRequest,
} from '@app/common/grpc/proto/payment';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class PaymentService {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    /**
     * 결제 생성 (초기화)
     * @param request
     * @returns
     */
    async createPayment(request: CreatePaymentRequest): Promise<PaymentEntity> {
        const payment = this.dataSource.manager.getRepository(PaymentEntity).create({
            orderId: request.orderId,
            userId: request.userId,
            amount: request.amount,
            provider: request.provider,
            status: PaymentMicroService.PaymentStatus.PENDING,
        });
        return this.dataSource.manager.getRepository(PaymentEntity).save(payment);
    }

    /**
     * 결제 확정
     * @param request
     * @returns
     */
    async confirmPayment(request: ConfirmPaymentRequest): Promise<PaymentEntity> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const payment = await qr.manager.getRepository(PaymentEntity).findOne({
                where: {
                    id: request.paymentId,
                    status: PaymentMicroService.PaymentStatus.PENDING,
                },
            });

            if (!payment) {
                throw new GrpcNotFoundException('결제 정보를 찾을 수 없습니다');
            }

            payment.status = PaymentMicroService.PaymentStatus.SUCCESS;
            payment.providerPaymentId = request.providerPaymentId;

            await qr.manager.getRepository(PaymentEntity).save(payment);

            await qr.commitTransaction();

            const savedPayment = await qr.manager.getRepository(PaymentEntity).findOne({
                where: { id: request.paymentId },
            });

            return savedPayment;
        } catch (error) {
            await qr.rollbackTransaction();
            throw error;
        } finally {
            await qr.release();
        }
    }

    /**
     * 결제 취소
     * @param request
     * @returns
     */
    async cancelPayment(request: CancelPaymentRequest): Promise<PaymentEntity> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const payment = await qr.manager.getRepository(PaymentEntity).findOne({
                where: {
                    id: request.paymentId,
                    status: PaymentMicroService.PaymentStatus.SUCCESS,
                },
            });
            if (!payment) {
                throw new GrpcNotFoundException('결제 정보를 찾을 수 없습니다');
            }

            payment.status = PaymentMicroService.PaymentStatus.CANCELED;
            await qr.manager.getRepository(PaymentEntity).save(payment);

            await qr.commitTransaction();

            const savedPayment = await qr.manager.getRepository(PaymentEntity).findOne({
                where: { id: request.paymentId },
            });

            return savedPayment;
        } catch (error) {
            await qr.rollbackTransaction();
            throw error;
        } finally {
            await qr.release();
        }
    }

    /**
     * 결제 실패
     * @param request
     * @returns
     */
    async failPayment(request: FailPaymentRequest): Promise<PaymentEntity> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const payment = await qr.manager.getRepository(PaymentEntity).findOne({
                where: {
                    id: request.paymentId,
                    status: PaymentMicroService.PaymentStatus.SUCCESS,
                },
            });

            if (!payment) {
                throw new GrpcNotFoundException('결제 정보를 찾을 수 없습니다');
            }

            payment.status = PaymentMicroService.PaymentStatus.FAILED;
            await qr.manager.getRepository(PaymentEntity).save(payment);

            await qr.commitTransaction();

            const savedPayment = await qr.manager.getRepository(PaymentEntity).findOne({
                where: { id: request.paymentId },
            });

            return savedPayment;
        } catch (error) {
            await qr.rollbackTransaction();
            throw error;
        } finally {
            await qr.release();
        }
    }
}
