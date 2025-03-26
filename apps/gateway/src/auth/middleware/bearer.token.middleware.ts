import {
    constructorMetadata,
    USER_SERVICE,
    UserMicroService,
} from '@app/common';
import {
    Inject,
    Injectable,
    NestMiddleware,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware, OnModuleInit {
    private authService: UserMicroService.AuthServiceClient;

    constructor(
        @Inject(USER_SERVICE) private readonly userMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.authService =
            this.userMicroService.getService<UserMicroService.AuthServiceClient>(
                'AuthService',
            );
    }

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
        const resp = await lastValueFrom(
            this.authService.parseBearerToken(
                { token },
                constructorMetadata(
                    BearerTokenMiddleware.name,
                    this.varifyToken.name,
                ),
            ),
        );
        return resp;
    }
}
