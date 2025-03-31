import { InjectRepository } from '@nestjs/typeorm';
import { UserDomain } from '../../../domain/user.domain';
import { UserRepositoryPort } from '../../../port/out/user.repostiroy.port';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserEntityMapper } from '../../../mapper/user.entity.mapper';
import { BadRequestException, Inject } from '@nestjs/common';
import { CryptoPort } from 'apps/user/src/auth/port/out/crypto.port';

export class UserRepositoryAdapter implements UserRepositoryPort {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject('CryptoPort')
        private readonly cryptoPort: CryptoPort,
    ) {}

    async findUserByEmail(email: string): Promise<UserDomain> {
        const user = await this.userRepository.findOneBy({ email });
        if (user) return new UserEntityMapper(user).toDomain();
        else return null;
    }

    async createUser(userDomain: UserDomain): Promise<UserDomain> {
        const user = await this.userRepository.save(userDomain);
        return new UserEntityMapper(user).toDomain();
    }

    async findUserById(userId: string): Promise<UserDomain> {
        const user = await this.userRepository.findOneBy({ id: userId });
        return new UserEntityMapper(user).toDomain();
    }

    async authentication(email: any, password: any): Promise<UserDomain> {
        const user = await this.userRepository.findOne({
            where: { email },
            select: { id: true, email: true, password: true },
        });

        if (!user) throw new BadRequestException('exception login');

        const passOk = await this.cryptoPort.compare(password, user.password);
        if (!passOk) throw new BadRequestException('exception login');

        return new UserEntityMapper(user).toDomain();
    }
}
