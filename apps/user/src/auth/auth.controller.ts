import { Controller, UnauthorizedException, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ParseBearerTokenDto } from './dto/parse.bearer.token.dto';
import { RpcInterceptor } from '@app/common/interceptor';
import { LoginDto } from './dto/login.dto';
import { UserMicroService } from '@app/common';

@Controller('auth')
@UserMicroService.AuthServiceControllerMethods()
export class AuthController implements UserMicroService.AuthServiceController {
    constructor(private readonly authService: AuthService) {}

    // @Post('register')
    // registerUser(@Authorization() token: string, @Body() dto: RegisterDto) {
    //     if (!token) throw new UnauthorizedException('token exception');
    //     return this.authService.register(token, dto);
    // }

    // @Post('login')
    // @UsePipes(ValidationPipe)
    // loginUser(@Authorization() token: string) {
    //     if (!token) throw new UnauthorizedException('token exception');
    //     return this.authService.login(token);
    // }

    // @MessagePattern({ cmd: 'parse-bearer-token' })
    // @UsePipes(ValidationPipe)
    // @UseInterceptors(RpcInterceptor)
    parseBearerToken(req: UserMicroService.ParseBearerTokenRequest) {
        const { token } = req;
        return this.authService.parseBearerToken(token, false);
    }

    // @MessagePattern({ cmd: 'register' })
    registerUser(req: UserMicroService.RegisterUserRequest) {
        const { token } = req;
        if (!token) throw new UnauthorizedException('token exception');
        return this.authService.register(token, req);
    }

    // @MessagePattern({ cmd: 'login' })
    loginUser(req: UserMicroService.LoginUserRequest) {
        const { token } = req;
        if (!token) throw new UnauthorizedException('token exception');
        return this.authService.login(token);
    }
}
