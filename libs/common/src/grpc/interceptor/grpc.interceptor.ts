import { Metadata } from '@grpc/grpc-js';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class GrpcInterceptor implements NestInterceptor {
    private readonly logger = new Logger(GrpcInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const className = context.getClass().name;
        const handler = context.getHandler().name;

        const rpcContext = context.switchToRpc();
        // const data = rpcContext.getData();
        const metadata = rpcContext.getContext() as Metadata;

        const traceId = metadata?.get('trace-id')?.[0] ?? 'no-trace-id';

        this.logger.log(`[REQ - ${traceId}] ${className}.${handler}`);

        return next.handle().pipe(
            tap(() => {
                this.logger.log(`[RES - ${traceId}] ${className}.${handler}`);
            }),
        );
    }
}
