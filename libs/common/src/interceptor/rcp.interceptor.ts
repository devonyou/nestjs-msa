import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, map, Observable } from 'rxjs';

@Injectable()
export class RpcInterceptor implements NestInterceptor {
    private logger = new Logger();

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToRpc().getContext();

        // this.logger.verbose(`CMD: ${JSON.parse(request.args).cmd}`);

        return next.handle().pipe(
            map(data => {
                const resp = {
                    status: 'success',
                    data,
                };
                // console.log(resp);
                return resp;
            }),
            catchError(err => {
                const resp = {
                    status: 'error',
                    error: err,
                };
                console.log(resp);
                throw new RpcException(err);
            }),
        );
    }
}
