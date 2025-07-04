import { UserMicroService } from '../grpc';

export interface UserPayload {
    sub: number;
    type: string;
    role: UserMicroService.UserRole;
    name: string;
    email: string;
    avatarUrl: string;
    version: number;
}
