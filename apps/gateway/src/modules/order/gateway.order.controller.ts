import { GatewayOrderService } from './gateway.order.service';
import { ApiController } from '../../common/decorator/api.controller.decorator';
import { Body, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../../common/decorator/auth.decorator';
import { Rbac } from '../../common/decorator/rbac.decorator';
import { UserMicroService } from '@app/common';
import { User } from '../../common/decorator/user.decorator';
import {
    CreateOrderRequestDto,
    InitiateOrderRequestDto,
    OrderListResponseDto,
    OrderResponseDto,
    UpdateOrderStatusDto,
} from './dto/order.dto';

@ApiController('order')
export class GatewayOrderController {
    constructor(private readonly orderService: GatewayOrderService) {}

    @Post('initiate')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    @ApiOperation({ summary: '주문 초기화' })
    @ApiCreatedResponse({ type: CreateOrderRequestDto })
    async initiateOrder(@User() user: UserPayload, @Body() initiateOrderRequestDto: InitiateOrderRequestDto) {
        return this.orderService.initiateOrder(user.sub, initiateOrderRequestDto);
    }

    @Get('user')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    @ApiOperation({ summary: '사용자 주문 목록 조회' })
    @ApiOkResponse({ type: OrderListResponseDto })
    async getOrdersByUserId(@User() user: UserPayload): Promise<OrderListResponseDto> {
        return this.orderService.getOrdersByUserId(user.sub);
    }

    @Get(':orderId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    @ApiOperation({ summary: '사용자 주문 조회' })
    @ApiOkResponse({ type: OrderResponseDto })
    async getOrderByIdAndUser(@User() user: UserPayload, @Param('orderId') orderId: string) {
        return this.orderService.getOrderByIdAndUser(user.sub, orderId);
    }

    @Patch(':orderId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    @ApiOperation({ summary: '주문 상태 업데이트' })
    @ApiOkResponse({ type: OrderResponseDto })
    async updateOrderStatus(
        @User() user: UserPayload,
        @Param('orderId') orderId: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    ) {
        return this.orderService.updateOrderStatus(user.sub, orderId, updateOrderStatusDto);
    }
}
