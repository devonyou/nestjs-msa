import { Inject, Injectable } from '@nestjs/common';
import { ParseTokenPort } from '../port/out/parse.token.port';

@Injectable()
export class ParseBearerTokenUsecase {
    constructor(
        @Inject('ParseTokenPort')
        private readonly parseTokenPort: ParseTokenPort,
    ) {}

    execute(rawToken: string) {
        return this.parseTokenPort.parseBearerToken(rawToken, false);
    }
}
