import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_GUARD_KEY } from '../../../common/decorator/auth.decorator';
import { GatewayAuthService } from '../gateway.auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private readonly gatewayAuthService: GatewayAuthService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const isRefresh = this.reflector.get<boolean>(AUTH_GUARD_KEY, context.getHandler());

            if (isRefresh === undefined) return true;

            const request = context.switchToHttp().getRequest<Request>();
            const rawToken = request?.headers?.authorization;
            if (!rawToken) throw new UnauthorizedException();

            const [bearer, jwtToken] = rawToken.split(' ');
            if (bearer.toLowerCase() !== 'bearer' || !jwtToken) {
                throw new UnauthorizedException();
            }

            const resp = await this.gatewayAuthService.verifyToken(jwtToken, isRefresh);
            if (!resp.verify) throw new UnauthorizedException();

            request.user = {
                sub: resp.user.id,
                type: isRefresh ? 'refresh' : 'access',
                role: resp.user.role,
                name: resp.user.name,
                email: resp.user.email,
                avatarUrl: resp.user.avatarUrl,
                version: resp.user.version,
            };

            return !!request.user.sub;
        } catch (err) {
            throw new UnauthorizedException(err.message);
        }
    }
}
