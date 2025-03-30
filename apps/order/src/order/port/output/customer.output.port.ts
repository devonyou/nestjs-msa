import { CustomerDomain } from '../../domain/customer.domain';

export interface CustomerOutputPort {
    findCustomerById(userId: string): Promise<CustomerDomain>;
}
