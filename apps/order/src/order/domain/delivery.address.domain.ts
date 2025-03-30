export class DeliveryAddressDomain {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;

    constructor(params: DeliveryAddressDomain) {
        this.name = params.name;
        this.street = params.street;
        this.city = params.city;
        this.postalCode = params.postalCode;
        this.country = params.country;
    }
}
