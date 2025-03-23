import { Controller, Get, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common/interceptor';
import { CreatePaymentDto } from './dto/create.payment.dto';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @MessagePattern({ cmd: 'create-payment' })
    @UsePipes(ValidationPipe)
    @UseInterceptors(RpcInterceptor)
    async createPayment(@Payload() dto: CreatePaymentDto) {
        return await this.paymentService.createPayment(dto);
    }
}
