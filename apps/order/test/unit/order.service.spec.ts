import { TestBed } from '@automock/jest';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { OrderMicroService, PaymentMicroService, ProductMicroService, RedisLockService } from '@app/common';
import { RmqContext } from '@nestjs/microservices';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { OrderService } from '../../src/modules/order/order.service';
import { OrderProductService } from '../../src/modules/order/order.product.service';
import { OrderPaymentService } from '../../src/modules/order/order.payment.service';
import { OrderNotificationService } from '../../src/modules/order/order.notification.service';
import { OrderEntity } from '../../src/entitites/order.entity';
import { OrderItemEntity } from '../../src/entitites/order.item.entity';
import { OrderDeliveryEntity } from '../../src/entitites/order.delivery.entity';

describe('OrderService', () => {
    let orderService: OrderService;
    let orderProductService: jest.Mocked<OrderProductService>;
    let orderPaymentService: jest.Mocked<OrderPaymentService>;
    let orderNotificationService: jest.Mocked<OrderNotificationService>;

    let mockDataSource: jest.Mocked<DataSource>;
    let mockQueryRunner: jest.Mocked<QueryRunner>;
    let mockOrderRepo: jest.Mocked<Repository<OrderEntity>>;

    let mockRedisLockService: jest.Mocked<RedisLockService>;
    let mockRmqContext: jest.Mocked<RmqContext>;

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(OrderService).compile();

        orderService = unit;
        orderProductService = unitRef.get(OrderProductService);
        orderPaymentService = unitRef.get(OrderPaymentService);
        orderNotificationService = unitRef.get(OrderNotificationService);

        mockDataSource = unitRef.get(getDataSourceToken() as string);
        mockRedisLockService = unitRef.get(RedisLockService);

        mockRmqContext = {
            getChannelRef: jest.fn().mockReturnValue({
                ack: jest.fn(),
            }),
            getMessage: jest.fn().mockReturnValue({}),
        } as unknown as jest.Mocked<RmqContext>;

        mockOrderRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        } as unknown as jest.Mocked<Repository<OrderEntity>>;

        mockQueryRunner = {
            connect: jest.fn().mockResolvedValue(undefined),
            startTransaction: jest.fn().mockResolvedValue(undefined),
            commitTransaction: jest.fn().mockResolvedValue(undefined),
            rollbackTransaction: jest.fn().mockResolvedValue(undefined),
            release: jest.fn().mockResolvedValue(undefined),
            manager: {
                getRepository: jest.fn().mockImplementation(entity => {
                    if (entity === OrderEntity) return mockOrderRepo;
                    return null;
                }),
            },
        } as unknown as jest.Mocked<QueryRunner>;

        jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);

        jest.spyOn(mockDataSource, 'getRepository').mockImplementation(entity => {
            if (entity === OrderEntity) return mockOrderRepo;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getOrderByIdAndUser', () => {
        const request: OrderMicroService.GetOrderByIdAndUserRequest = {
            orderId: '1',
            userId: 1,
        };

        it('should return an order', async () => {
            const order = new OrderEntity();

            jest.spyOn(mockOrderRepo, 'findOne').mockResolvedValue(order);

            const result = await orderService.getOrderByIdAndUser(request);

            expect(mockOrderRepo.findOne).toHaveBeenCalledWith({
                where: { id: request.orderId, userId: request.userId },
                relations: ['items', 'delivery'],
            });
            expect(result).toEqual(order);
        });
    });

    describe('getOrdersByUserId', () => {
        const request: OrderMicroService.GetOrdersByUserIdRequest = {
            userId: 1,
        };

        it('should return an order', async () => {
            const order = new OrderEntity();

            jest.spyOn(mockOrderRepo, 'find').mockResolvedValue([order]);

            const result = await orderService.getOrdersByUserId(request.userId);

            expect(mockOrderRepo.find).toHaveBeenCalledWith({
                where: { userId: request.userId },
                relations: ['items', 'delivery'],
            });
            expect(result).toEqual([order]);
        });
    });

    describe('processInitiateOrder', () => {
        const products = [{ id: 1, price: 1000, name: '상품1' }] as unknown as ProductMicroService.ProductResponse[];

        const request: OrderMicroService.InitiateOrderRequest = {
            userId: 1,
            items: [{ productId: 1, quantity: 1 }],
            delivery: new OrderDeliveryEntity(),
        };

        it('should return an order', async () => {
            jest.spyOn(mockRedisLockService, 'acquireLock').mockResolvedValue('LOCK' as any);

            jest.spyOn(orderProductService, 'getProductsByIds').mockResolvedValue({
                products,
                total: 1,
            });
            jest.spyOn(mockRedisLockService, 'releaseLock').mockResolvedValue(undefined);

            const createdOrder = {
                id: 'order-1',
                userId: request.userId,
                amount: 1000,
                items: [
                    {
                        productId: 1,
                        quantity: 1,
                        price: 1000,
                        productName: '상품1',
                    },
                ],
                status: 'PAYMENT_PENDING',
            } as unknown as OrderEntity;

            jest.spyOn(mockOrderRepo, 'create').mockReturnValue(createdOrder);
            jest.spyOn(mockOrderRepo, 'save').mockResolvedValue(createdOrder);

            jest.spyOn(orderProductService, 'createStockReservation').mockResolvedValue(undefined);

            const createdPayment = { id: 'payment-1' } as unknown as PaymentMicroService.PaymentResponse;
            jest.spyOn(orderPaymentService, 'createPayment').mockResolvedValue(createdPayment);

            jest.spyOn(mockOrderRepo, 'update').mockResolvedValue(undefined);

            const result = await orderService.processInitiateOrder(request, mockRmqContext);

            expect(mockRedisLockService.acquireLock).toHaveBeenCalled();
            expect(orderProductService.getProductsByIds).toHaveBeenCalledWith([1]);
            expect(mockOrderRepo.create).toHaveBeenCalled();
            expect(mockOrderRepo.save).toHaveBeenCalledWith(createdOrder);
            expect(orderPaymentService.createPayment).toHaveBeenCalledWith({
                userId: request.userId,
                orderId: createdOrder.id,
                amount: createdOrder.amount,
                provider: 'toss',
            });
            expect(mockOrderRepo.update).toHaveBeenCalledWith(createdOrder.id, { paymentId: createdPayment.id });
            expect(result).toEqual(createdOrder);

            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
            expect(mockRedisLockService.releaseLock).toHaveBeenCalled();
        });

        it('should throw an error if the product is not found', async () => {
            jest.spyOn(mockRedisLockService, 'acquireLock').mockResolvedValue('LOCK' as any);

            jest.spyOn(orderProductService, 'getProductsByIds').mockResolvedValue({
                products,
                total: 1,
            });
            jest.spyOn(mockRedisLockService, 'releaseLock').mockResolvedValue(undefined);

            jest.spyOn(orderProductService, 'getProductsByIds').mockResolvedValue({
                products,
                total: 0,
            });

            await expect(orderService.processInitiateOrder(request, mockRmqContext)).rejects.toThrow(
                GrpcNotFoundException,
            );
        });
    });

    describe('completeOrder', () => {
        const request: OrderMicroService.CompleteOrderRequest = {
            userId: 1,
            orderId: '1',
            providerPaymentId: '1',
            userEmail: 'test@test.com',
        };

        it('should return an order', async () => {
            const order = new OrderEntity();
            order.id = request.orderId;
            order.status = OrderMicroService.OrderStatus.PAYMENT_PENDING;
            order.paymentId = 1;
            order.userId = 1;
            order.createdAt = new Date();
            order.amount = 1000;
            order.items = [new OrderItemEntity()];

            const updatedOrder = { ...order } as OrderEntity;
            updatedOrder.status = OrderMicroService.OrderStatus.PAYMENT_SUCCESS;

            const payment = { id: 1 } as unknown as PaymentMicroService.PaymentResponse;

            jest.spyOn(mockOrderRepo, 'findOne').mockResolvedValueOnce(order).mockResolvedValueOnce(updatedOrder);
            jest.spyOn(mockOrderRepo, 'update').mockResolvedValue(undefined);
            jest.spyOn(orderProductService, 'confirmStockReservation').mockResolvedValue(undefined);
            jest.spyOn(orderPaymentService, 'confirmPayment').mockResolvedValue(payment);
            jest.spyOn(orderNotificationService, 'sendOrderConfirmationEmail').mockResolvedValue(undefined);

            const result = await orderService.completeOrder(request);

            expect(mockOrderRepo.findOne).toHaveBeenNthCalledWith(1, {
                where: {
                    id: request.orderId,
                    userId: request.userId,
                    status: OrderMicroService.OrderStatus.PAYMENT_PENDING,
                },
            });
            expect(mockOrderRepo.findOne).toHaveBeenNthCalledWith(2, {
                where: { id: order.id, userId: request.userId },
                relations: ['items'],
            });
            expect(orderProductService.confirmStockReservation).toHaveBeenCalledWith({
                orderId: order.id,
            });
            expect(orderPaymentService.confirmPayment).toHaveBeenCalledWith({
                paymentId: order.paymentId,
                providerPaymentId: request.providerPaymentId,
            });
            expect(orderNotificationService.sendOrderConfirmationEmail).toHaveBeenCalled();
            expect(mockOrderRepo.update).toHaveBeenCalledWith(order.id, {
                status: OrderMicroService.OrderStatus.PAYMENT_SUCCESS,
            });

            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();

            expect(result).toEqual(updatedOrder);
        });

        it('should throw an error if the order is not found', async () => {
            jest.spyOn(mockRedisLockService, 'acquireLock').mockResolvedValue('LOCK' as any);

            jest.spyOn(mockOrderRepo, 'findOne').mockResolvedValue(null);

            await expect(orderService.completeOrder(request)).rejects.toThrow(GrpcNotFoundException);

            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });
    });

    describe('cancelOrder', () => {
        const request: OrderMicroService.CancelOrderRequest = {
            orderId: '1',
            userId: 1,
        };

        it('should return an order', async () => {
            const order = new OrderEntity();
            order.id = request.orderId;
            order.userId = request.userId;
            order.status = OrderMicroService.OrderStatus.PAYMENT_SUCCESS;
            order.paymentId = 1;

            const cancelledOrder = { ...order } as OrderEntity;
            cancelledOrder.status = OrderMicroService.OrderStatus.PAYMENT_CANCELED;

            jest.spyOn(mockOrderRepo, 'findOne').mockResolvedValueOnce(order).mockResolvedValueOnce(cancelledOrder);
            jest.spyOn(mockOrderRepo, 'update').mockResolvedValue(undefined);
            jest.spyOn(orderProductService, 'restoreStockReservation').mockResolvedValue(undefined);
            jest.spyOn(orderPaymentService, 'cancelPayment').mockResolvedValue(undefined);

            const result = await orderService.cancelOrder(request);

            expect(mockOrderRepo.findOne).toHaveBeenNthCalledWith(1, {
                where: {
                    id: order.id,
                    userId: order.userId,
                },
            });
            expect(mockOrderRepo.findOne).toHaveBeenNthCalledWith(2, {
                where: { id: order.id },
            });
            expect(mockOrderRepo.update).toHaveBeenCalledWith(order.id, {
                status: OrderMicroService.OrderStatus.PAYMENT_CANCELED,
            });
            expect(orderProductService.restoreStockReservation).toHaveBeenCalledWith({ orderId: order.id });
            expect(orderPaymentService.cancelPayment).toHaveBeenCalledWith({ paymentId: order.paymentId });

            expect(result).toEqual(cancelledOrder);

            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });

        it('should throw an error if the order is not in the payment success status', async () => {
            jest.spyOn(mockOrderRepo, 'findOne').mockResolvedValue(null);

            await expect(orderService.cancelOrder(request)).rejects.toThrow(GrpcNotFoundException);
        });

        it('should throw an error if the order is not found', async () => {
            const order = new OrderEntity();
            order.id = request.orderId;
            order.userId = request.userId;
            order.status = OrderMicroService.OrderStatus.PAYMENT_PENDING;
            order.paymentId = 1;

            jest.spyOn(mockOrderRepo, 'findOne').mockResolvedValue(order);

            await expect(orderService.cancelOrder(request)).rejects.toThrow(GrpcNotFoundException);
        });
    });

    describe('updateOrderStatusById', () => {
        it('should return an order', async () => {
            const order = new OrderEntity();
            order.id = '1';
            order.status = OrderMicroService.OrderStatus.PAYMENT_SUCCESS;

            jest.spyOn(mockOrderRepo, 'findOne').mockResolvedValue(order);
            jest.spyOn(mockOrderRepo, 'save').mockResolvedValue(order);

            const result = await orderService.updateOrderStatusById({
                orderId: order.id,
                status: OrderMicroService.OrderStatus.PAYMENT_SUCCESS,
            });

            expect(mockOrderRepo.findOne).toHaveBeenCalledWith({ where: { id: order.id } });
            expect(result).toEqual(order);
        });

        it('should throw an error if the order is not found', async () => {
            jest.spyOn(mockOrderRepo, 'findOne').mockResolvedValue(null);

            await expect(
                orderService.updateOrderStatusById({
                    orderId: '1',
                    status: OrderMicroService.OrderStatus.PAYMENT_SUCCESS,
                }),
            ).rejects.toThrow(GrpcNotFoundException);
        });
    });
});
