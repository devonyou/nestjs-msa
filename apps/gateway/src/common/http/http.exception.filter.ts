import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { format, toZonedTime } from 'date-fns-tz';
import { Request, Response } from 'express';
import { status } from '@grpc/grpc-js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private logger = new Logger(HttpExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { ip, method, originalUrl, httpVersion, headers } = request;
        const { 'user-agent': userAgent } = headers;
        const timestamp = format(toZonedTime(new Date(), 'Asia/Seoul'), 'yyyy-MM-dd HH:mm:ss');
        let details: { exceptionName?: string; error?: string };

        try {
            details = JSON.parse(exception?.details);
        } catch (error) {
            details = {};
        }

        let errorName = null;
        let message = null;
        let statusCode = null;

        if (exception instanceof HttpException) {
            const error = exception.getResponse() as string | Error;
            statusCode = exception.getStatus();
            errorName = error['error'] || this.getErrorName(status.UNKNOWN);
            message = error['message'] || this.getErrorName(status.UNKNOWN);
        } else if (details?.exceptionName === 'RpcException') {
            const rpcErrorCode = exception?.code;
            errorName = this.getErrorName(rpcErrorCode);
            statusCode = this.rpcToHttpStatus(rpcErrorCode);
            message = details?.error;
        } else {
            errorName = this.getErrorName(status.UNKNOWN);
            statusCode = this.rpcToHttpStatus(status.UNKNOWN);
            message = errorName;
        }

        this.logger.error(
            `${timestamp} - - ${ip} "${method} ${originalUrl} HTTP/${httpVersion} ${statusCode}" - ${userAgent}`,
        );

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
