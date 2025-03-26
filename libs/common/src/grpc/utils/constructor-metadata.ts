import { Metadata } from '@grpc/grpc-js';
import { v4 as uuid } from 'uuid';

export const constructorMetadata = (callerClass: string, callerMethod: string, prevMetadata?: Metadata) => {
    const metadata = prevMetadata ?? new Metadata();

    const traceId = metadata.getMap()['trace-id'] || uuid();

    metadata.set('trace-id', traceId);
    metadata.set('client-class', callerClass);
    metadata.set('client-method', callerMethod);

    return metadata;
};
