import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create.order.dto';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
    PAYMENT_SERVICE,
    PRODUCT_SERVICE,
    USER_SERVICE,
    UserMicroService,
    ProductMicroService,
    PaymentMicroService,
    constructorMetadata,
} from '@app/common';
import { PaymentCanceledException } from './exception/payment.canceled.exception';
import { Product } from './entity/product.entity';
import { AddressDto } from './dto/address.dto';
import { PaymentDto } from './dto/payment.dto';
import { Customer } from './entity/customer.entity';
import { Order, OrderStatus } from './entity/order.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentFailedException } from './exception/payment.failed.exception';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class OrderService implements OnModuleInit {
    private userService: UserMicroService.UserServiceClient;
    private productService: ProductMicroService.ProductServiceClient;
    private paymentService: PaymentMicroService.PaymentServiceClient;

    constructor(
        // @Inject(USER_SERVICE) private readonly userService: ClientProxy,
        // @Inject(PRODUCT_SERVICE) private readonly productService: ClientProxy,
        // @Inject(PAYMENT_SERVICE) private readonly paymentService: ClientProxy,
        @Inject(USER_SERVICE) private readonly userMicroService: ClientGrpc,
        @Inject(PRODUCT_SERVICE) private readonly productMicroService: ClientGrpc,
        @Inject(PAYMENT_SERVICE) private readonly paymentMicroService: ClientGrpc,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    ) {}

    onModuleInit() {
        this.userService = this.userMicroService.getService('UserService');
        this.productService = this.productMicroService.getService('ProductService');
        this.paymentService = this.paymentMicroService.getService('PaymentService');
    }

    async createOrder(dto: CreateOrderDto, metadata: Metadata) {
        const { productIds, payment, address, meta } = dto;

        // 1) 사용자 정보 가져오기
        const user = await this.getUserFromToken(meta.user.sub, metadata);

        // 2) 상품 정보 가져오기
        const products = await this.getProductsByIds(productIds, metadata);

        // 3) 총 금액 계산하기
        const totalAmount = this.calculateTotalAmount(products);

        // 4) 금액 검증하기 - total이 맞는지 (프론트에서 보내준 데이터랑)
        this.validatePaymentAmount(totalAmount, payment.amount);

        // 5) 주문 생성하기 - 데이터베이스에 넣기
        const customer = this.createCustomer(user);
        const order = await this.createNewOrder(customer, products, address, payment);

        // 6) 결제 시도하기
        const processedPayment = await this.processPayment(order._id.toString(), payment, user.email, metadata);

        // 7) 결과 반환하기
        return await this.orderModel.findById(order._id);
    }

    private async getUserFromToken(userId: string, metadata: Metadata) {
        // 1) User MS : JWT TOKEN 검증
        // const authResp = await lastValueFrom(this.userService.send({ cmd: 'parse-bearer-token' }, { token }));
        // if (authResp.status === 'error') throw new PaymentCanceledException();

        // 2) User MS : USER 정보 조회
        // const userId = authResp.data.sub;
        // const userResp = await lastValueFrom(this.userService.send({ cmd: 'get-user-info' }, { userId }));
        // if (userResp.status === 'error') throw new PaymentCanceledException();
        // return userResp.data;

        const userResp = await lastValueFrom(
            this.userService.getUserInfo(
                { userId: userId },
                constructorMetadata(OrderService.name, 'getUserFormToken', metadata),
            ),
        );
        return userResp;
    }

    private async getProductsByIds(productIds: string[], metadata: Metadata): Promise<Product[]> {
        // const resp = await lastValueFrom(this.productService.send({ cmd: 'get-products-info' }, { productIds }));
        // if (resp.status === 'error') throw new PaymentCanceledException();

        // Product entity로 전환
        // return resp.data.map(product => ({
        //     productId: product.id,
        //     price: product.price,
        //     name: product.name,
        // }));

        const resp = await lastValueFrom(
            this.productService.getProductsInfo(
                { productIds },
                constructorMetadata(OrderService.name, 'getProductsByIds', metadata),
            ),
        );
        return resp.products.map(p => ({
            productId: p.id,
            price: p.price,
            name: p.name,
        }));
    }

    private calculateTotalAmount(products: Product[]) {
        return products.reduce((acc, o) => acc + o.price, 0);
    }

    private validatePaymentAmount(a: number, b: number) {
        if (a !== b) {
            throw new PaymentCanceledException();
        }
    }

    private createCustomer(user: { id: string; email: string; name: string }) {
        return {
            userId: user.id,
            email: user.email,
            name: user.name,
        };
    }

    private async createNewOrder(
        customer: Customer,
        products: Product[],
        deliveryAddress: AddressDto,
        payment: PaymentDto,
    ) {
        return await this.orderModel.create({
            customer,
            products,
            deliveryAddress,
            payment,
        });
    }

    private async processPayment(orderId: string, payment: PaymentDto, userEmail: string, metadata: Metadata) {
        try {
            // const resp = await lastValueFrom(
            //     this.paymentService.send({ cmd: 'create-payment' }, { ...payment, userEmail, orderId }),
            // );
            // if (resp.status === 'error') throw new PaymentFailedException();

            const resp = await lastValueFrom(
                this.paymentService.createPayment(
                    { ...payment, userEmail, orderId },
                    constructorMetadata(OrderService.name, 'processPayment', metadata),
                ),
            );

            const isPaid = resp.paymentStatus === 'Approved';
            if (!isPaid) throw new PaymentFailedException();
            await this.orderModel.findByIdAndUpdate(orderId, {
                status: OrderStatus.paymentProcessed,
            });
            return resp;
        } catch (err) {
            if (err instanceof PaymentFailedException) {
                await this.orderModel.findByIdAndUpdate(orderId, {
                    status: OrderStatus.paymentFailed,
                });
                throw new PaymentFailedException();
            }
        }
    }

    changeOrderStatus(id: string, status: OrderStatus) {
        return this.orderModel.findByIdAndUpdate(id, {
            status,
        });
    }
}
