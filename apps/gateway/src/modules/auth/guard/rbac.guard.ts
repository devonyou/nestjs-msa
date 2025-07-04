import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Rbac } from '../../../common/decorator/rbac.decorator';
import { UserMicroService } from '@app/common';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const rbacs = this.reflector.get<UserMicroService.UserRole[]>(Rbac, context.getHandler());
        if (rbacs === undefined || rbacs.length === 0) return true;

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user;
        if (!user) return false;

        const userRole = user.role;
        return rbacs.includes(userRole);
    }
}
