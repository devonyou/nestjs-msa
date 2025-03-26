import {
    constructorMetadata,
    USER_SERVICE,
    UserMicroService,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class AuthService implements OnModuleInit {
    private authService: UserMicroService.AuthServiceClient;

    constructor(
        @Inject(USER_SERVICE) private readonly userMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.authService = this.userMicroService.getService('AuthService');
    }

    register(token: string, dto: RegisterDto, metadata: Metadata) {
        return lastValueFrom(
            this.authService.registerUser(
                { ...dto, token },
                constructorMetadata(
                    AuthService.name,
                    this.register.name,
                    metadata,
                ),
            ),
        );
    }

    login(token: string, metadata: Metadata) {
        return lastValueFrom(
            this.authService.loginUser(
                { token },
                constructorMetadata(
                    AuthService.name,
                    this.login.name,
                    metadata,
                ),
            ),
        );
    }
}
