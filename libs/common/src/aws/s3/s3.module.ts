import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { S3ModuleOptions } from './aws.interface';
import { S3Service } from './s3.service';

@Global()
@Module({})
export class S3Module {
    static forRootAsync(options: {
        useFactory: (...args: any[]) => S3ModuleOptions | Promise<S3ModuleOptions>;
        inject?: any[];
    }): DynamicModule {
        return {
            module: S3Module,
            imports: [ConfigModule],
            providers: [
                {
                    provide: S3Client.name,
                    useFactory: async (...args: any[]) => {
                        const opts = await options.useFactory(...args);
                        return new S3Client({
                            region: opts.region,
                            credentials: {
                                accessKeyId: opts.accessKeyId,
                                secretAccessKey: opts.secretAccessKey,
                            },
                        });
                    },
                    inject: options.inject || [],
                },
                S3Service,
            ],
            exports: [S3Service],
        };
    }
}
