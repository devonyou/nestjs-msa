import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator<JwtPayload>((data: any, context: ExecutionContext): JwtPayload => {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req?.user) throw new InternalServerErrorException();
    return req.user;
});
