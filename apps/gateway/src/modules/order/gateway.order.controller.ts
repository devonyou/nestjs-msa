import { GatewayOrderService } from './gateway.order.service';
import { ApiController } from '../../common/decorator/api.controller.decorator';
import { Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Auth } from '../../common/decorator/auth.decorator';
import { Rbac } from '../../common/decorator/rbac.decorator';
import { UserMicroService } from '@app/common';

@ApiController('order')
export class GatewayOrderController {
    constructor(private readonly orderService: GatewayOrderService) {}

    @Post()
    @Auth(false)
    @Rbac([UserMicroService.UserRole.USER])
    @ApiOperation({ summary: '주문 생성' })
    async createOrder() {
        return 1;
    }
}
