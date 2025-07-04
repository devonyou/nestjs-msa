import { Metadata } from '@grpc/grpc-js';
import { v4 as uuid } from 'uuid';

type ExtraMetadata = Record<string, string>;

export const createGrpcMetadata = (
    sourceClass: string,
    sourceHandler: string,
    prevMetadata?: Metadata,
    extra?: ExtraMetadata,
): Metadata => {
    const metadata = prevMetadata ?? new Metadata();
    const traceId = metadata.get('trace-id')?.[0] || uuid();

    metadata.set('trace-id', traceId);
    metadata.set('source-class', sourceClass);
    metadata.set('source-handler', sourceHandler);

    if (extra) {
        Object.entries(extra).forEach(([key, value]) => {
            metadata.set(key, value);
        });
    }

    return metadata;
};
