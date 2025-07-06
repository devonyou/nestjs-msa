import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { RedisService } from '@app/common';

@Module({
    imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController],
    providers: [UserService, JwtService, RedisService],
    exports: [UserService],
})
export class UserModule {}
