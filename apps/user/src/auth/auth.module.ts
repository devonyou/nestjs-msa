import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './adapter/out/controller/auth.controller';
import { CreateUserUsecase } from './usecase/create.user.usecase';
import { LoginUserUsecase } from './usecase/login.user.usecase';
import { ParseTokenAdapter } from './adapter/out/jwt/parse.token.adapter';
import { CryptoAdapter } from './adapter/out/crypto/crypto.adapter';
import { ParseBearerTokenUsecase } from './usecase/parse.bearer.token.usecase';

@Module({
    imports: [JwtModule, forwardRef(() => UserModule)],
    controllers: [AuthController],
    providers: [
        JwtService,
        CreateUserUsecase,
        LoginUserUsecase,
        ParseBearerTokenUsecase,
        { provide: 'ParseTokenPort', useClass: ParseTokenAdapter },
        { provide: 'CryptoPort', useClass: CryptoAdapter },
    ],
    exports: ['CryptoPort'],
})
export class AuthModule {}
