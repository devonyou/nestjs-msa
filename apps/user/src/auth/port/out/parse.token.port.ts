import { UserDomain } from 'apps/user/src/user/domain/user.domain';

export interface ParseTokenPort {
    parseBasicToken(rawToken: string): { email: any; password: any };

    parseBearerToken(rawToken: string, isRefreshToken: boolean);

    issueToken(user: UserDomain, isRefreshToken: boolean): Promise<string>;
}
