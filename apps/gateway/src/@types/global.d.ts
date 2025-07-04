import { UserPayload as UserPayloadType } from '@app/common/@types';

declare global {
    type UserPayload = UserPayloadType;
}

export {};
