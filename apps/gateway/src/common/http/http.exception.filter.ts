import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { format, toZonedTime } from 'date-fns-tz';
import { Request, Response } from 'express';
import { status } from '@grpc/grpc-js';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        this.logger.log(exception);

        const { ip, method, originalUrl, httpVersion, headers } = request;
        const { 'user-agent': userAgent } = headers;
        const timestamp = format(toZonedTime(new Date(), 'Asia/Seoul'), 'yyyy-MM-dd HH:mm:ss');

        const statusCode = exception.getStatus();
        let errorName = this.getErrorName(status.UNKNOWN);
        let message = this.getErrorName(status.UNKNOWN);

        try {
            if (typeof exception.getResponse() === 'object') {
                const match = exception.message.match(/^(\d+)\s+([A-Z_]+):\s+(.+)$/);
                const code = parseInt(match[1], 10);
                const details = JSON.parse(match[3]);
                if (details?.exceptionName === 'RpcException') {
                    errorName = this.getErrorName(code);
                    message = details?.error;
                }
            }
        } catch (e) {
            errorName = errorName ?? this.getErrorName(status.UNKNOWN);
            message = message ?? this.getErrorName(status.UNKNOWN);
        } finally {
            this.logger.error(
                `${timestamp} - - ${ip} "${method} ${originalUrl} HTTP/${httpVersion} ${statusCode}" - ${userAgent}`,
            );
        }

        return response.status(statusCode).json({
            success: false,
            statusCode: statusCode,
            error: errorName,
            message: message,
            timestamp,
        });
    }

    private getErrorName(code: number): string {
        switch (code) {
            case status.UNAUTHENTICATED:
                return 'Unauthorized';
            case status.PERMISSION_DENIED:
                return 'Forbidden';
            case status.UNAVAILABLE:
                return 'ServiceUnavailable';
            case status.NOT_FOUND:
                return 'NotFound';
            case status.UNIMPLEMENTED:
                return 'MethodNotAllowed';
            case status.ALREADY_EXISTS:
                return 'Conflict';
            case status.INVALID_ARGUMENT:
                return 'UnprocessableEntity';
            case status.RESOURCE_EXHAUSTED:
                return 'TooManyRequests';
            case status.INTERNAL:
            case status.UNKNOWN:
                return 'InternalServerError';
            default:
                return 'UnknownError';
        }
    }

    private rpcToHttpStatus(code: number): number {
        switch (code) {
            case status.UNAUTHENTICATED:
                return 401;
            case status.PERMISSION_DENIED:
                return 403;
            case status.UNAVAILABLE:
                return 502;
            case status.NOT_FOUND:
                return 404;
            case status.UNIMPLEMENTED:
                return 405;
            case status.ALREADY_EXISTS:
                return 409;
            case status.INVALID_ARGUMENT:
                return 422;
            case status.RESOURCE_EXHAUSTED:
                return 429;
            case status.INTERNAL:
            case status.UNKNOWN:
            default:
                return 500;
        }
    }
}
