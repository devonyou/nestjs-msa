import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';

@Module({
    imports: [UserModule, JwtModule, TypeOrmModule.forFeature([User])],
    controllers: [AuthController],
    providers: [AuthService, JwtService],
})
export class AuthModule {}
