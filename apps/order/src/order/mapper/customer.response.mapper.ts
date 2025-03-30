import { UserMicroService } from '@app/common';
import { CustomerDomain } from '../domain/customer.domain';

export class CustomerResponseMapper {
    constructor(
        private readonly response: UserMicroService.GetUserInfoResponse,
    ) {}

    toCustomerDomain(): CustomerDomain {
        return {
            ...this.response,
            userId: this.response.id,
        };
    }
}
