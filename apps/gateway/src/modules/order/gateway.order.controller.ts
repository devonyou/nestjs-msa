import { GatewayOrderService } from './gateway.order.service';
import { ApiController } from '../../common/decorator/api.controller.decorator';
import { Body, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Auth } from '../../common/decorator/auth.decorator';
import { Rbac } from '../../common/decorator/rbac.decorator';
import { UserMicroService } from '@app/common';
import { User } from '../../common/decorator/user.decorator';
import { CreateOrderRequestDto, UpdateOrderStatusDto } from './dto/order.dto';

@ApiController('order')
export class GatewayOrderController {
    constructor(private readonly orderService: GatewayOrderService) {}

    @Post()
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    @ApiOperation({ summary: '주문 생성' })
    async createOrder(@User() user: UserPayload, @Body() createOrderRequestDto: CreateOrderRequestDto) {
        return this.orderService.createOrder(user.sub, createOrderRequestDto);
    }

    @Get('user')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    async getOrdersByUserId(@User() user: UserPayload) {
        return this.orderService.getOrdersByUserId(user.sub);
    }

    @Get(':id')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    async getOrderByIdAndUser(@User() user: UserPayload, @Param('id') id: string) {
        return this.orderService.getOrderByIdAndUser(user.sub, id);
    }

    @Patch(':id')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    async updateOrderStatus(
        @User() user: UserPayload,
        @Param('id') id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    ) {
        return this.orderService.updateOrderStatus(user.sub, id, updateOrderStatusDto);
    }
}
