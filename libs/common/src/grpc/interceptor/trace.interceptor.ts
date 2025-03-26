import { InterceptingCall } from '@grpc/grpc-js';

export const traceInterceptor = (serviceName: string) => (options, nextCall) => {
    return new InterceptingCall(nextCall(options), {
        start: function (metadata, listener, next) {
            metadata.set('client-service', serviceName);
            next(metadata, listener);
        },
    });
};
