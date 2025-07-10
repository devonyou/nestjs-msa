import { Catch, RpcExceptionFilter as NestRpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionFilter implements NestRpcExceptionFilter<RpcException> {
    catch(exception: RpcException): Observable<any> {
        const error = exception.getError() as any;

        throw new RpcException(error);
        return throwError(() => error);
    }
}
