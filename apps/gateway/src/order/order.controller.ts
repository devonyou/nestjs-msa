import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create.order.dto';
import { TokenGuard } from '../auth/guard/token.guard';
import { UserPayloadDto } from '@app/common';
import { UserPayload } from './decorator/user.payload.decorator';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    @UseGuards(TokenGuard)
    async createOrder(@UserPayload() userPayload: UserPayloadDto, @Body() dto: CreateOrderDto) {
        return await this.orderService.createOrder(userPayload, dto);
    }
}
