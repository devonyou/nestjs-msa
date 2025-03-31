import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../port/out/user.repostiroy.port';
import { UserDomain } from '../domain/user.domain';

@Injectable()
export class FindUserUsecase {
    constructor(
        @Inject('UserRepositoryPort')
        private readonly userRepositoryPort: UserRepositoryPort,
    ) {}

    findUserById(userId: string): Promise<UserDomain> {
        return this.userRepositoryPort.findUserById(userId);
    }
}
