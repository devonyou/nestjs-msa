import { UserPayload } from '@app/common/@types';

declare module 'express-serve-static-core' {
    interface Request {
        user: UserPayload;
    }
}
