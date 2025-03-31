import { UserEntity } from '../adapter/out/orm/entity/user.entity';
import { UserDomain } from '../domain/user.domain';

export class UserEntityMapper {
    constructor(private readonly userEntity: UserEntity) {}

    toDomain(): UserDomain {
        const user = new UserDomain({
            ...this.userEntity,
        });
        user.setId(this.userEntity.id);
        return user;
    }
}
