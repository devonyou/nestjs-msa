import { UserPayloadDto } from '@app/common';
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const UserPayload = createParamDecorator<UserPayloadDto>((data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    if (!req?.user) throw new InternalServerErrorException();
    return req.user;
});
