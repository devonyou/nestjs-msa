import { Controller, Get, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common/interceptor';
import { GetUserInfoDto } from './dto/get.user.info.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @MessagePattern({ cmd: 'get-user-info' })
    @UsePipes(ValidationPipe)
    @UseInterceptors(RpcInterceptor)
    getUserInfo(@Payload() dto: GetUserInfoDto) {
        const { userId } = dto;
        return this.userService.getUserById(userId);
    }
}
