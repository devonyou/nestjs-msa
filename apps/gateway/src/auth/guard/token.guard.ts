import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export class TokenGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        return !!req.user;
    }
}
