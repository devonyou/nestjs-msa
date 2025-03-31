import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../user/port/out/user.repostiroy.port';
import { UserDomain } from '../../user/domain/user.domain';
import { ParseTokenPort } from '../port/out/parse.token.port';
import { CryptoPort } from '../port/out/crypto.port';
import { CreateUserDto } from '../dto/create.user.dto';

@Injectable()
export class CreateUserUsecase {
    constructor(
        @Inject('UserRepositoryPort')
        private readonly userRepositoryPort: UserRepositoryPort,
        @Inject('ParseTokenPort')
        private readonly parseTokenPort: ParseTokenPort,
        @Inject('CryptoPort')
        private readonly cryptoPort: CryptoPort,
    ) {}

    async execute(dto: CreateUserDto): Promise<UserDomain> {
        const { token, ...rest } = dto;
        const { email, password } = this.parseTokenPort.parseBasicToken(token);

        const user = await this.userRepositoryPort.findUserByEmail(email);
        if (user) throw new BadRequestException('Already user email');

        const hashedPassword = this.cryptoPort.hash(password);

        const userDomain = new UserDomain({
            ...rest,
            email: email,
            password: hashedPassword,
        });

        const newUser = await this.userRepositoryPort.createUser(userDomain);
        userDomain.setId(newUser.id);

        return userDomain;
    }
}
