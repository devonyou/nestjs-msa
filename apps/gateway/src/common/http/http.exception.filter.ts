import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { format, toZonedTime } from 'date-fns-tz';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { ip, method, originalUrl, httpVersion, headers } = request;
        const timestamp = format(toZonedTime(new Date(), 'Asia/Seoul'), 'yyyy-MM-dd HH:mm:ss');
        const userAgent = headers['user-agent'];
        const statusCode = exception.getStatus();
        const responsePayload = exception.getResponse();

        let error: string;
        let message: string;

        if (typeof responsePayload === 'object' && responsePayload !== null) {
            // const msg = (responsePayload as any).message;
            // error = Array.isArray(msg) ? msg[0] : (msg ?? 'BadRequest');
            // message = exception.message;
            error = (responsePayload as any).error;
            message = (responsePayload as any).message;
        } else {
            error = responsePayload as string;
            message = exception.message;
        }

        this.logger.error(
            `${timestamp} - - ${ip} "${method} ${originalUrl} HTTP/${httpVersion} ${statusCode}" - ${userAgent}`,
        );

        response.status(statusCode).json({
            success: false,
            statusCode,
            error: error,
            message,
            timestamp,
        });
    }
}
