import { USER_SERVICE } from '@app/common';
import { Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
    constructor(@Inject(USER_SERVICE) private readonly userMicroService: ClientProxy) {}

    async use(req: any, res: any, next: (error?: Error | any) => void) {
        const token = this.getRawToken(req);
        if (!token) {
            next();
            return;
        }

        const payload = await this.varifyToken(token);
        req.user = payload;
        next();
    }

    getRawToken(req: Request) {
        const authHeader = req?.headers?.authorization;
        return authHeader;
    }

    async varifyToken(token: string) {
        const resp = await lastValueFrom(this.userMicroService.send({ cmd: 'parse-bearer-token' }, { token }));
        if (resp.status === 'error') {
            throw new UnauthorizedException('exception token');
        }
        return resp.data;
    }
}
