import { createGrpcMetadata, UserMicroService } from '@app/common';
import { Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GatewayAuthService implements OnModuleInit {
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

    async verifyToken(jwtToken: any, isRefresh: boolean, metadata?: Metadata) {
        const stream = this.userService.verifyToken(
            { token: jwtToken, isRefresh },
            createGrpcMetadata(GatewayAuthService.name, this.verifyToken.name, metadata),
        );
        const resp = await lastValueFrom(stream);
        return resp;
    }
}
