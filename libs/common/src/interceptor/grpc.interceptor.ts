import { Metadata } from '@grpc/grpc-js';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable, tap, timestamp } from 'rxjs';

@Injectable()
export class GrpcInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const data = context.switchToRpc().getData();
        const ctx = context.switchToRpc().getContext() as Metadata;
        const meta = ctx.getMap();

        const targetClass = context.getClass().name;
        const targetHandler = context.getHandler().name;

        const traceId = meta['trace-id'];
        const clientService = meta['client-service'];
        const clientClass = meta['client-class'];
        const clientMethod = meta['client-method'];

        const from = `${clientService}/${clientClass}/${clientMethod}`;
        const to = `${targetClass}/${targetHandler}`;

        const requestTimestamp = new Date();

        const recievedReqeustLog = {
            type: 'RECIEVED_REQUEST',
            traceId,
            from,
            to,
            data,
            timestamp: requestTimestamp.toUTCString(),
        };

        console.log(recievedReqeustLog);

        return next.handle().pipe(
            map(data => {
                const responseTimestamp = new Date();
                const responseTime = `${+requestTimestamp - +responseTimestamp}ms`;

                const responseLog = {
                    type: 'RECIEVED_RESPONSE',
                    traceId,
                    from,
                    to,
                    data,
                    timestamp: responseTime,
                };

                console.log(responseLog);

                return data;
            }),
        );
    }
}
