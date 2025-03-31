export class ProductDomain {
    id: string;
    name: string;
    price: number;
    desc: string;
    stock: number;

    constructor(
        params: Pick<ProductDomain, 'name' | 'price' | 'desc' | 'stock'>,
    ) {
        this.name = params.name;
        this.price = params.price;
        this.desc = params.desc;
        this.stock = params.stock;
    }

    setId(id: string) {
        this.id = id;
    }

    setStock(stock: number) {
        this.stock = stock;
    }
}
