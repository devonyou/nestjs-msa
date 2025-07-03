import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

// export const Auth = Reflector.createDecorator<boolean>();

export const AUTH_GUARD_KEY = 'auth';

export function Auth(isRefresh: boolean): MethodDecorator & ClassDecorator {
    return applyDecorators(
        // Reflector.createDecorator<boolean>()(isRefresh),
        SetMetadata(AUTH_GUARD_KEY, isRefresh),
        ApiBearerAuth(isRefresh ? 'refreshToken' : 'accessToken'),
    );
}
