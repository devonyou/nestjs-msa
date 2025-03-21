import { USER_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(@Inject(USER_SERVICE) private readonly userMicroService: ClientProxy) {}

    register(token: string, dto: RegisterDto) {
        return lastValueFrom(this.userMicroService.send({ cmd: 'register' }, { ...dto, token }));
    }

    login(token: string) {
        return lastValueFrom(this.userMicroService.send({ cmd: 'login' }, { token }));
    }
}
