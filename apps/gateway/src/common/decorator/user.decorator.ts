import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator<UserPayload>((data: any, context: ExecutionContext): UserPayload => {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req?.user) throw new InternalServerErrorException();
    return req.user;
});
