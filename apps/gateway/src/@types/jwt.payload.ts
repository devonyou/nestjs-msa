import { UserMicroService } from '@app/common';

export interface JwtPayload {
    sub: number;
    type: string;
    role: UserMicroService.UserRole;
    name: string;
    email: string;
    avatarUrl: string;
    version: number;
}
