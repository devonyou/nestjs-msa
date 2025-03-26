import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Authorization } from './decorator/authorization.decorator';
import { RegisterDto } from './dto/register.dto';
import { Metadata } from '@grpc/grpc-js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    registerUser(
        @Authorization() token: string,
        @Body() dto: RegisterDto,
        metadata: Metadata,
    ) {
        if (!token) throw new UnauthorizedException('token exception');
        return this.authService.register(token, dto, metadata);
    }

    @Post('login')
    loginUser(@Authorization() token: string, metadata: Metadata) {
        if (!token) throw new UnauthorizedException('token exception');
        return this.authService.login(token, metadata);
    }
}
