import { JwtService } from '@nestjs/jwt';
import { ParseTokenPort } from '../../../port/out/parse.token.port';
import {
    BadRequestException,
    Inject,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserDomain } from 'apps/user/src/user/domain/user.domain';

export class ParseTokenAdapter implements ParseTokenPort {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) {}

    parseBasicToken(rawToken: string): { email: any; password: any } {
        const [basic, token] = rawToken.split(' ');
        if (!basic || !token) {
            throw new BadRequestException('token format exception');
        }

        if (basic.toLowerCase() !== 'basic') {
            throw new BadRequestException('token format exception');
        }

        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [email, password] = decoded.split(':');
        if (!email || !password) {
            throw new BadRequestException('token format exception');
        }

        return {
            email,
            password,
        };
    }

    async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
        try {
            const [bearer, token] = rawToken.split(' ');
            if (!bearer || !token) throw new Error();
            if (bearer.toLowerCase() !== 'bearer') throw new Error();

            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>(
                    isRefreshToken
                        ? 'REFRESH_TOKEN_SECRET'
                        : 'ACCESS_TOKEN_SECRET',
                ),
            });

            if (payload.type !== 'refresh' && isRefreshToken) {
                throw new Error();
            } else if (payload.type !== 'access' && !isRefreshToken) {
                throw new Error();
            }

            return payload;
        } catch (err) {
            throw new UnauthorizedException('token format exception');
        }
    }

    issueToken(user: UserDomain, isRefreshToken: boolean): Promise<string> {
        const refreshTokenSecret = this.configService.get<string>(
            'REFRESH_TOKEN_SECRET',
        );
        const accessTokenSecret = this.configService.get<string>(
            'ACCESS_TOKEN_SECRET',
        );

        return this.jwtService.signAsync(
            {
                // sub: user.id ?? user.sub,
                sub: user.id,
                type: isRefreshToken ? 'refresh' : 'access',
            },
            {
                secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
                expiresIn: '24h',
            },
        );
    }
}
