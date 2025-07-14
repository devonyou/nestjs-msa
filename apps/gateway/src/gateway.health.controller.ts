import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
    HealthController,
    HealthMicroService,
    NotificationMicroService,
    OrderMicroService,
    PaymentMicroService,
    ProductMicroService,
    UserMicroService,
} from '@app/common';
import {
    GRPCHealthIndicator,
    HealthCheck,
    HealthCheckResult,
    HealthCheckService,
    HttpHealthIndicator,
    MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { ClientProxyFactory, GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class GatewayHealthController extends HealthController {
    private userService;

    constructor(
        private configService: ConfigService,

        private readonly health: HealthCheckService,
        private http: HttpHealthIndicator,
        private grpc: GRPCHealthIndicator,
        private microservice: MicroserviceHealthIndicator,
    ) {
        super();

        this.userService = ClientProxyFactory.create({
            transport: Transport.GRPC,
            options: {
                url: this.configService.getOrThrow<string>('USER_GRPC_URL'),
                package: UserMicroService.protobufPackage,
                protoPath: join(process.cwd(), 'proto', 'user.proto'),
            },
        });
    }

    @Get()
    @HealthCheck()
    @HttpCode(HttpStatus.OK)
    healthCheck(): Promise<HealthCheckResult> {
        return this.health.check([
            // user http server
            () => this.http.pingCheck('user.http', 'http://user:3000/auth/google'),

            // user grpc server
            () =>
                this.grpc.checkService<GrpcOptions>('user.grpc', UserMicroService.protobufPackage, {
                    timeout: 3000,
                    package: HealthMicroService.protobufPackage,
                    protoPath: join(process.cwd(), 'proto', 'health.proto'),
                    url: this.configService.getOrThrow<string>('USER_GRPC_URL'),
                }),

            // product grpc server
            () =>
                this.grpc.checkService<GrpcOptions>('product.grpc', ProductMicroService.protobufPackage, {
                    timeout: 3000,
                    package: HealthMicroService.protobufPackage,
                    protoPath: join(process.cwd(), 'proto', 'health.proto'),
                    url: this.configService.getOrThrow<string>('PRODUCT_GRPC_URL'),
                }),

            // order grpc server
            () =>
                this.grpc.checkService<GrpcOptions>('order.grpc', OrderMicroService.protobufPackage, {
                    timeout: 3000,
                    package: HealthMicroService.protobufPackage,
                    protoPath: join(process.cwd(), 'proto', 'health.proto'),
                    url: this.configService.getOrThrow<string>('ORDER_GRPC_URL'),
                }),

            // payment grpc server
            () =>
                this.grpc.checkService<GrpcOptions>('payment.grpc', PaymentMicroService.protobufPackage, {
                    timeout: 3000,
                    package: HealthMicroService.protobufPackage,
                    protoPath: join(process.cwd(), 'proto', 'health.proto'),
                    url: this.configService.getOrThrow<string>('PAYMENT_GRPC_URL'),
                }),

            // notification grpc server
            () =>
                this.grpc.checkService<GrpcOptions>('notification.grpc', NotificationMicroService.protobufPackage, {
                    timeout: 3000,
                    package: HealthMicroService.protobufPackage,
                    protoPath: join(process.cwd(), 'proto', 'health.proto'),
                    url: this.configService.getOrThrow<string>('NOTIFICATION_GRPC_URL'),
                }),
        ]);
    }
}
