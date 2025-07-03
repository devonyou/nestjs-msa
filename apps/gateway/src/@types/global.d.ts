import { JwtPayload as JwtPayloadType } from './jwt.payload';

declare global {
    type JwtPayload = JwtPayloadType;
}

export {};
