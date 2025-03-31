import { UserDomain } from '../../domain/user.domain';

export interface UserRepositoryPort {
    findUserByEmail(email: string): Promise<UserDomain>;

    createUser(userDomain: UserDomain): Promise<UserDomain>;

    findUserById(userId: string): Promise<UserDomain>;

    authentication(email: any, password: any): Promise<UserDomain>;
}
