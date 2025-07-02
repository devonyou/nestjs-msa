import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { format, toZonedTime } from 'date-fns-tz';

@Injectable()
export class HttpSuccessInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // const httpCtx = context.switchToHttp();
        // const request = httpCtx.getRequest<Request>();

        const timestamp = format(toZonedTime(new Date(), 'Asia/Seoul'), 'yyyy-MM-dd HH:mm:ss');

        return next.handle().pipe(
            map(data => {
                return {
                    success: true,
                    timestamp,
                    data: data ?? null,
                };
            }),
        );
    }
}
