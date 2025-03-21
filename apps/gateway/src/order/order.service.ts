import { UserMeta } from './../../../../libs/common/src/dto/interface/user.meta.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create.order.dto';
import { ORDER_SERVICE, UserPayloadDto } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
    constructor(@Inject(ORDER_SERVICE) private readonly orderMicroService: ClientProxy) {}

    async createOrder(userPayload: UserPayloadDto, dto: CreateOrderDto) {
        return await lastValueFrom(
            this.orderMicroService.send<any, CreateOrderDto & UserMeta>(
                { cmd: 'create-order' },
                {
                    meta: {
                        user: userPayload,
                    },
                    ...dto,
                },
            ),
        );
    }
}
