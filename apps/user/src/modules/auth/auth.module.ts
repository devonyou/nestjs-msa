import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { UserModule } from '../user/user.module';

@Module({
    imports: [forwardRef(() => UserModule)],
    controllers: [AuthController],
    providers: [GoogleStrategy],
})
export class AuthModule {}
