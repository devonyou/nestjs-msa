import { USER_SERVICE, UserMicroService } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
    private authService: UserMicroService.AuthServiceClient;

    constructor(@Inject(USER_SERVICE) private readonly userMicroService: ClientGrpc) {}

    onModuleInit() {
        this.authService = this.userMicroService.getService('AuthService');
    }

    register(token: string, dto: RegisterDto) {
        return lastValueFrom(this.authService.registerUser({ ...dto, token }));
    }

    login(token: string) {
        return lastValueFrom(this.authService.loginUser({ token }));
    }
}
