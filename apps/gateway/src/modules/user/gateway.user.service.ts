import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { UserMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UpdateUserInfoRequestDto } from './dto/user.update.dto';

@Injectable()
export class GatewayUserService implements OnModuleInit {
    private userService: UserMicroService.UserServiceClient;

    constructor(
        @Inject(UserMicroService.USER_SERVICE_NAME)
        private readonly userMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.userService = this.userMicroService.getService<UserMicroService.UserServiceClient>(
            UserMicroService.USER_SERVICE_NAME,
        );
    }

    async getUserInfoByUserId(userId: number): Promise<UserMicroService.User> {
        const stream = this.userService.getUserInfoByUserId({ id: userId });
        const resp = await lastValueFrom(stream);
        return resp;
    }

    async refreshToken(userId: number) {
        const stream = this.userService.refreshToken({ userId: userId });
        const resp = await lastValueFrom(stream);
        return resp;
    }

    async updateUserInfo(userId: number, dto: UpdateUserInfoRequestDto): Promise<UserMicroService.User> {
        const stream = this.userService.updateUserInfo({ id: userId, ...dto });
        const resp = await lastValueFrom(stream);
        return resp;
    }
}
