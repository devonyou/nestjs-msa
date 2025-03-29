import { UserMicroService } from '@app/common';
import { CustomerEntity } from '../../../domain/customer.entity';

export class GetUserInfoResponseMapper {
    constructor(
        private readonly response: UserMicroService.GetUserInfoResponse,
    ) {}

    toDomain(): CustomerEntity {
        return new CustomerEntity({
            email: this.response.email,
            name: this.response.name,
            userId: this.response.id,
        });
    }
}
