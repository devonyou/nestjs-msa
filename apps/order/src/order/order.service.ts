import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create.order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PAYMENT_SERVICE, PRODUCT_SERVICE, USER_SERVICE, UserMeta, UserPayloadDto } from '@app/common';
import { PaymentCanceledException } from './exception/payment.canceled.exception';
import { Product } from './entity/product.entity';
import { AddressDto } from './dto/address.dto';
import { PaymentDto } from './dto/payment.dto';
import { Customer } from './entity/customer.entity';
import { Order, OrderStatus } from './entity/order.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentFailedException } from './exception/payment.failed.exception';

@Injectable()
export class OrderService {
    constructor(
        @Inject(USER_SERVICE) private readonly userService: ClientProxy,
        @Inject(PRODUCT_SERVICE) private readonly productService: ClientProxy,
        @Inject(PAYMENT_SERVICE) private readonly paymentService: ClientProxy,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    ) {}

    async createOrder(dto: CreateOrderDto) {
        const { productIds, payment, address, meta } = dto;

        // 1) 사용자 정보 가져오기
        const user = await this.getUserFromToken(meta.user.sub);

        // 2) 상품 정보 가져오기
        const products = await this.getProductsByIds(productIds);

        // 3) 총 금액 계산하기
        const totalAmount = this.calculateTotalAmount(products);

        // 4) 금액 검증하기 - total이 맞는지 (프론트에서 보내준 데이터랑)
        this.validatePaymentAmount(totalAmount, payment.amount);

        // 5) 주문 생성하기 - 데이터베이스에 넣기
        const customer = this.createCustomer(user);
        const order = await this.createNewOrder(customer, products, address, payment);

        // 6) 결제 시도하기
        const processedPayment = await this.processPayment(order._id.toString(), payment, user.email);

        // 7) 결과 반환하기
        return this.orderModel.findById(order._id);
    }

    private async getUserFromToken(userId: string) {
        // 1) User MS : JWT TOKEN 검증
        // const authResp = await lastValueFrom(this.userService.send({ cmd: 'parse-bearer-token' }, { token }));
        // if (authResp.status === 'error') throw new PaymentCanceledException();

        // 2) User MS : USER 정보 조회
        // const userId = authResp.data.sub;
        const userResp = await lastValueFrom(this.userService.send({ cmd: 'get-user-info' }, { userId }));
        if (userResp.status === 'error') throw new PaymentCanceledException();

        return userResp.data;
    }

    private async getProductsByIds(productIds: string[]): Promise<Product[]> {
        const resp = await lastValueFrom(this.productService.send({ cmd: 'get-products-info' }, { productIds }));
        if (resp.status === 'error') throw new PaymentCanceledException();

        // Product entity로 전환
        return resp.data.map(product => ({
            productId: product.id,
            price: product.price,
            name: product.name,
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

    private async processPayment(orderId: string, payment: PaymentDto, userEmail: string) {
        try {
            const resp = await lastValueFrom(
                this.paymentService.send({ cmd: 'create-payment' }, { ...payment, userEmail, orderId }),
            );
            if (resp.status === 'error') throw new PaymentFailedException();

            const isPaid = resp.data.paymentStatus === 'Approved';
            if (!isPaid) throw new PaymentFailedException();
            await this.orderModel.findByIdAndUpdate(orderId, {
                status: OrderStatus.paymentProcessed,
            });
            return resp.data;
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
