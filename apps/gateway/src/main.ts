import { NestFactory, Reflector } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { HttpSuccessInterceptor } from './common/http/http.success.interceptor';
import { HttpExceptionFilter } from './common/http/http.exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GatewayAuthService } from './modules/auth/gateway.auth.service';
import { AuthGuard } from './modules/auth/guard/auth.guard';

class Server {
    private HTTP_PORT: number;
    private configService: ConfigService;

    constructor(private readonly app: NestExpressApplication) {
        this.app = app;
        this.init();
    }

    private init() {
        this.configService = new ConfigService();
        this.HTTP_PORT = this.configService.getOrThrow<number>('HTTP_PORT');

        this.setupCors();
        this.setupGlobalInterceptor();
        this.setupGlobalFilter();
        this.setupSwagger();
        this.setupGlobalGuard();
    }

    private setupCors() {
        this.app.enableCors({
            origin: this.configService.getOrThrow<string>('CORS_ORIGIN'),
            methods: 'GET,POST,PATCH,PUT,DELETE,HEAD,OPTIONS',
            credentials: true,
        });
    }

    private setupGlobalInterceptor() {
        this.app.useGlobalInterceptors(
            new HttpSuccessInterceptor(),
            new ClassSerializerInterceptor(this.app.get(Reflector)),
        );
    }

    private setupGlobalFilter() {
        this.app.useGlobalFilters(new HttpExceptionFilter());
    }

    private setupGlobalGuard() {
        this.app.useGlobalGuards(
            new AuthGuard(this.app.get(GatewayAuthService), this.app.get(Reflector)),
            // new RBACGuard(this.app.get(Reflector)),
        );
    }

    private setupSwagger() {
        const config = new DocumentBuilder()
            .setTitle(this.configService.getOrThrow<string>('SWAGGER_TITLE'))
            .setDescription(this.configService.getOrThrow<string>('SWAGGER_DESCRIPTION'))
            .setVersion(this.configService.getOrThrow<string>('SWAGGER_VERSION'))
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'Authorization',
                    in: 'headers',
                },
                'accessToken',
            )
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'Authorization',
                    in: 'headers',
                },
                'refreshToken',
            )
            .build();

        const document = SwaggerModule.createDocument(this.app, config);
        SwaggerModule.setup(this.configService.getOrThrow<string>('SWAGGER_PATH'), this.app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                deepScanRoutes: true,
            },
        });
    }

    start() {
        this.app.set('trust proxy', true);
        this.app.listen(this.HTTP_PORT, '0.0.0.0');
    }
}

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(GatewayModule);
    const server = new Server(app);
    server.start();
}

bootstrap()
    .then(() => {
        if (process.env.NODE_ENV === 'production') {
            process.send('ready');
        }

        new Logger(process.env.NODE_ENV).log(`✅ Server on http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`);
        new Logger(process.env.NODE_ENV).log(process.env.NODE_ENV);
    })
    .catch(error => {
        new Logger(process.env.NODE_ENV).error(`❌ Server error ${error}`);
        process.exit(1);
    });
