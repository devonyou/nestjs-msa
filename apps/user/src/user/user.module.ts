import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './adapter/out/orm/entity/user.entity';
import { UserController } from './adapter/out/controller/user.controller';
import { FindUserUsecase } from './usecase/find.user.usecase';
import { UserRepositoryAdapter } from './adapter/out/orm/user.repository.adapter';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        forwardRef(() => AuthModule),
    ],
    controllers: [UserController],
    providers: [
        FindUserUsecase,
        { provide: 'UserRepositoryPort', useClass: UserRepositoryAdapter },
    ],
    exports: ['UserRepositoryPort'],
})
export class UserModule {}
