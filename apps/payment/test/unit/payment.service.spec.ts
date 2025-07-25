import { TestBed } from '@automock/jest';
import { PaymentService } from '../../src/modules/payment/payment.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { PaymentEntity } from '../../src/entities/payment.entity';
import { PaymentMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

describe('PaymentService', () => {
    let paymentService: PaymentService;
    let mockDataSource: jest.Mocked<DataSource>;
    let mockQueryRunner: jest.Mocked<QueryRunner>;
    let mockPaymentRepo: jest.Mocked<Repository<PaymentEntity>>;

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(PaymentService).compile();

        paymentService = unit;

        mockDataSource = unitRef.get(getDataSourceToken() as string);

        mockPaymentRepo = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<Repository<PaymentEntity>>;

        mockQueryRunner = {
            connect: jest.fn().mockResolvedValue(undefined),
            startTransaction: jest.fn().mockResolvedValue(undefined),
            commitTransaction: jest.fn().mockResolvedValue(undefined),
            rollbackTransaction: jest.fn().mockResolvedValue(undefined),
            release: jest.fn().mockResolvedValue(undefined),
            manager: {
                getRepository: jest.fn().mockImplementation(entity => {
                    if (entity === PaymentEntity) return mockPaymentRepo;
                    return null;
                }),
            },
        } as any;

        jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);

        jest.spyOn(mockDataSource, 'getRepository').mockImplementation(entity => {
            if (entity === PaymentEntity) return mockPaymentRepo;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPayment', () => {
        const request: PaymentMicroService.CreatePaymentRequest = {
            orderId: '1',
            userId: 1,
            amount: 1000,
            provider: 'toss',
        };

        it('should create a payment', async () => {
            const payment = new PaymentEntity();

            jest.spyOn(mockPaymentRepo, 'create').mockReturnValue(payment);
            jest.spyOn(mockPaymentRepo, 'save').mockResolvedValue(payment);

            const result = await paymentService.createPayment(request);

            expect(mockPaymentRepo.create).toHaveBeenCalledWith({
                ...request,
                status: PaymentMicroService.PaymentStatus.PENDING,
            });
            expect(mockPaymentRepo.save).toHaveBeenCalledWith(payment);
            expect(result).toEqual(payment);
        });
    });

    describe('confirmPayment', () => {
        const request: PaymentMicroService.ConfirmPaymentRequest = {
            paymentId: 1,
            providerPaymentId: '1',
        };

        it('should confirm a payment', async () => {
            const payment = new PaymentEntity();

            jest.spyOn(mockPaymentRepo, 'findOne').mockResolvedValueOnce(payment).mockResolvedValueOnce(payment);
            jest.spyOn(mockPaymentRepo, 'save').mockResolvedValueOnce(undefined);

            const result = await paymentService.confirmPayment(request);

            expect(mockPaymentRepo.findOne).toHaveBeenNthCalledWith(1, {
                where: { id: request.paymentId, status: PaymentMicroService.PaymentStatus.PENDING },
            });
            expect(mockPaymentRepo.findOne).toHaveBeenNthCalledWith(2, {
                where: { id: request.paymentId },
            });
            expect(mockPaymentRepo.save).toHaveBeenCalledWith({
                ...payment,
                status: PaymentMicroService.PaymentStatus.SUCCESS,
            });
            expect(result).toEqual(payment);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the payment is not found', async () => {
            jest.spyOn(mockPaymentRepo, 'findOne').mockResolvedValueOnce(undefined);

            await expect(paymentService.confirmPayment(request)).rejects.toThrow(GrpcNotFoundException);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
        });
    });

    describe('cancelPayment', () => {
        const request: PaymentMicroService.CancelPaymentRequest = {
            paymentId: 1,
        };

        it('should cancel a payment', async () => {
            const payment = new PaymentEntity();

            jest.spyOn(mockPaymentRepo, 'findOne').mockResolvedValueOnce(payment).mockResolvedValueOnce(payment);
            jest.spyOn(mockPaymentRepo, 'save').mockResolvedValueOnce(undefined);

            const result = await paymentService.cancelPayment(request);

            expect(mockPaymentRepo.findOne).toHaveBeenNthCalledWith(1, {
                where: { id: request.paymentId, status: PaymentMicroService.PaymentStatus.SUCCESS },
            });
            expect(mockPaymentRepo.findOne).toHaveBeenNthCalledWith(2, {
                where: { id: request.paymentId },
            });
            expect(mockPaymentRepo.save).toHaveBeenCalledWith({
                ...payment,
                status: PaymentMicroService.PaymentStatus.CANCELED,
            });
            expect(result).toEqual(payment);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
        });

        it('should throw an error if the payment is not found', async () => {
            jest.spyOn(mockPaymentRepo, 'findOne').mockResolvedValueOnce(undefined);

            await expect(paymentService.cancelPayment(request)).rejects.toThrow(GrpcNotFoundException);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
        });
    });

    describe('failPayment', () => {
        const request: PaymentMicroService.FailPaymentRequest = {
            paymentId: 1,
        };

        it('should fail a payment', async () => {
            const payment = new PaymentEntity();

            jest.spyOn(mockPaymentRepo, 'findOne').mockResolvedValueOnce(payment).mockResolvedValueOnce(payment);
            jest.spyOn(mockPaymentRepo, 'save').mockResolvedValueOnce(undefined);

            const result = await paymentService.failPayment(request);

            expect(mockPaymentRepo.findOne).toHaveBeenNthCalledWith(1, {
                where: { id: request.paymentId, status: PaymentMicroService.PaymentStatus.SUCCESS },
            });
            expect(mockPaymentRepo.findOne).toHaveBeenNthCalledWith(2, {
                where: { id: request.paymentId },
            });
            expect(mockPaymentRepo.save).toHaveBeenCalledWith({
                ...payment,
                status: PaymentMicroService.PaymentStatus.FAILED,
            });
            expect(result).toEqual(payment);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the payment is not found', async () => {
            jest.spyOn(mockPaymentRepo, 'findOne').mockResolvedValueOnce(undefined);

            await expect(paymentService.failPayment(request)).rejects.toThrow(GrpcNotFoundException);

            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
        });
    });
});
