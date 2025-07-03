import { JwtPayload } from './jwt.payload';

declare module 'express-serve-static-core' {
    interface Request {
        user: JwtPayload;
    }
}
