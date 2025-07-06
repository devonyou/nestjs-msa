import { status } from '@grpc/grpc-js';
import { HttpException } from '@nestjs/common';

const grpcToHttpStatusMap: Record<number, number> = {
    [status.UNAUTHENTICATED]: 401,
    [status.PERMISSION_DENIED]: 403,
    [status.NOT_FOUND]: 404,
    [status.ALREADY_EXISTS]: 409,
    [status.INVALID_ARGUMENT]: 422,
    [status.RESOURCE_EXHAUSTED]: 429,
    [status.UNAVAILABLE]: 502,
    [status.UNIMPLEMENTED]: 405,
    [status.INTERNAL]: 500,
    [status.UNKNOWN]: 500,
};

const grpcToErrorNameMap: Record<number, string> = {
    [status.UNAUTHENTICATED]: 'Unauthorized',
    [status.PERMISSION_DENIED]: 'Forbidden',
    [status.NOT_FOUND]: 'NotFound',
    [status.ALREADY_EXISTS]: 'Conflict',
    [status.INVALID_ARGUMENT]: 'UnprocessableEntity',
    [status.RESOURCE_EXHAUSTED]: 'TooManyRequests',
    [status.UNAVAILABLE]: 'ServiceUnavailable',
    [status.UNIMPLEMENTED]: 'MethodNotAllowed',
    [status.INTERNAL]: 'InternalServerError',
    [status.UNKNOWN]: 'InternalServerError',
};

export function throwHttpExceptionFromGrpcError(error) {
    // const match = error.message.match(/^(\d+)\s+([A-Z_]+):\s+(.+)$/);
    const httpStatus = grpcToHttpStatusMap[error.code] ?? 500;
    const errorName = grpcToErrorNameMap[error.code] ?? 'UnknownError';

    throw new HttpException(
        {
            statusCode: httpStatus,
            message: JSON.parse(error.details).error,
            error: errorName,
        },
        httpStatus,
    );
}
