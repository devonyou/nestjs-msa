export class CustomerDomain {
    userId: string;
    email: string;
    name: string;

    constructor(params: CustomerDomain) {
        this.userId = params.userId;
        this.email = params.email;
        this.name = params.name;
    }
}
