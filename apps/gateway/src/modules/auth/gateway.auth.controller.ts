import { ApiController } from '../../common/decorator/api.controller.decorator';
import { Get, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { Auth } from '../../common/decorator/auth.decorator';
import { User } from '../../common/decorator/user.decorator';
import { GatewayUserService } from '../user/gateway.user.service';
import { TokenDto } from '../user/dto/token.dto';

@ApiController('auth')
export class GatewayAuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly gatewayUserService: GatewayUserService,
    ) {}

    @Get('google')
    @ApiOperation({ summary: '구글 로그인 리다이렉트' })
    signInWithGoogle(@Res() res: Response) {
        res.redirect(`${this.configService.get('USER_HTTP_URL')}/auth/google`);
    }

    @Post('refresh')
    @Auth(true)
    @ApiOperation({ summary: '리프레시 토큰 발급' })
    @ApiCreatedResponse({ description: '리프레시 토큰 발급 성공', type: TokenDto })
    refreshToken(@User() user: JwtPayload): Promise<TokenDto> {
        return this.gatewayUserService.refreshToken(user.sub);
    }
}
