import { GatewayOrderService } from './gateway.order.service';
import { ApiController } from '../../common/decorator/api.controller.decorator';
import { Body, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../../common/decorator/auth.decorator';
import { Rbac } from '../../common/decorator/rbac.decorator';
import { UserMicroService } from '@app/common';
import { User } from '../../common/decorator/user.decorator';
import {
    CancelOrderRequestDto,
    CompleteOrderRequestDto,
    CreateOrderRequestDto,
    InitiateOrderRequestDto,
    OrderListResponseDto,
    OrderResponseDto,
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

    @Post('complete')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    @ApiOperation({ summary: '주문 완료' })
    @ApiCreatedResponse({ type: CreateOrderRequestDto })
    async completeOrder(@User() user: UserPayload, @Body() completeOrderRequestDto: CompleteOrderRequestDto) {
        return this.orderService.completeOrder(user.sub, completeOrderRequestDto);
    }

    @Post('cancel')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    @ApiOperation({ summary: '주문 취소' })
    @ApiCreatedResponse({ type: OrderResponseDto })
    async cancelOrder(@User() user: UserPayload, @Body() cancelOrderRequestDto: CancelOrderRequestDto) {
        return this.orderService.cancelOrder(user.sub, cancelOrderRequestDto);
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
}
