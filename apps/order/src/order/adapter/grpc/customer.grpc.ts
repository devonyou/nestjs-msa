import { Inject, OnModuleInit } from '@nestjs/common';
import { CustomerOutputPort } from '../../port/output/customer.output.port';
import { CustomerDomain } from '../../domain/customer.domain';
import { USER_SERVICE, UserMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CustomerResponseMapper } from '../../mapper/customer.response.mapper';

export class CustomerGrpc implements CustomerOutputPort, OnModuleInit {
    userService: UserMicroService.UserServiceClient;

    constructor(
        @Inject(USER_SERVICE) private readonly userMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.userService =
            this.userMicroService.getService<UserMicroService.UserServiceClient>(
                'UserService',
            );
    }

    async findCustomerById(userId: string): Promise<CustomerDomain> {
        const resp = await lastValueFrom(
            this.userService.getUserInfo({ userId }),
        );
        const mapper = new CustomerResponseMapper(resp);
        return mapper.toCustomerDomain();
    }
}
