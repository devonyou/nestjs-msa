import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { toZonedTime, format } from 'date-fns-tz';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    private logger = new Logger(HttpLoggerMiddleware.name);

    use(req: Request, res: Response, next: () => void) {
        const { ip, method, originalUrl, httpVersion, headers } = req;
        const { 'user-agent': userAgent } = headers;
        const { statusCode } = res;

        const timestamp = format(toZonedTime(new Date(), 'Asia/Seoul'), 'yyyy-MM-dd HH:mm:ss');

        this.logger.log(
            `${timestamp} - - ${ip} "${method} ${originalUrl} HTTP/${httpVersion} ${statusCode}" - ${userAgent}`,
        );

        if (res.errored) {
            return res.send(res.errored);
        }

        next();
    }
}
