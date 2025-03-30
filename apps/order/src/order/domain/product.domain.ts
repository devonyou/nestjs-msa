export class ProductDomain {
    productId: string;
    name: string;
    price: number;

    constructor(param: ProductDomain) {
        this.productId = param.productId;
        this.name = param.name;
        this.price = param.price;
    }
}
