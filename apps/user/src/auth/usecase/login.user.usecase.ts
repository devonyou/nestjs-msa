import { UserRepositoryPort } from './../../user/port/out/user.repostiroy.port';
import { ParseTokenPort } from '../port/out/parse.token.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LoginUserUsecase {
    constructor(
        @Inject('ParseTokenPort')
        private readonly parseTokenPort: ParseTokenPort,
        @Inject('UserRepositoryPort')
        private readonly userRepositoryPort: UserRepositoryPort,
    ) {}

    async execute(rawToken: string) {
        const { email, password } =
            this.parseTokenPort.parseBasicToken(rawToken);

        const user = await this.userRepositoryPort.authentication(
            email,
            password,
        );

        return {
            refreshToken: await this.parseTokenPort.issueToken(user, true),
            accessToken: await this.parseTokenPort.issueToken(user, false),
        };
    }
}
