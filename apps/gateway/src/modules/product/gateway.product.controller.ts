import { Get } from '@nestjs/common';
import { ApiController } from '../../common/decorator/api.controller.decorator';

@ApiController('product')
export class GatewayProductController {
    // constructor(private readonly gatewayProductService: GatewayProductService) {}

    @Get()
    get() {
        return 1;
    }
}
