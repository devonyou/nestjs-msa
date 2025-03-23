import { Controller, UnauthorizedException, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ParseBearerTokenDto } from './dto/parse.bearer.token.dto';
import { RpcInterceptor } from '@app/common/interceptor';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
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

    @MessagePattern({ cmd: 'parse-bearer-token' })
    @UsePipes(ValidationPipe)
    @UseInterceptors(RpcInterceptor)
    parseBearerToken(@Payload() payload: ParseBearerTokenDto) {
        const { token } = payload;
        return this.authService.parseBearerToken(token, false);
    }

    @MessagePattern({ cmd: 'register' })
    registerUser(@Payload() payload: RegisterDto) {
        const { token } = payload;
        if (!token) throw new UnauthorizedException('token exception');
        return this.authService.register(token, payload);
    }

    @MessagePattern({ cmd: 'login' })
    loginUser(@Payload() payload: LoginDto) {
        const { token } = payload;
        if (!token) throw new UnauthorizedException('token exception');
        return this.authService.login(token);
    }
}
