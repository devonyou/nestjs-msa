import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entity/product.entity';

@Injectable()
export class ProductService {
    constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

    async createSampleProduct() {
        const data = [
            { name: '사과', price: 1000, desc: '달디단 사과', stock: 2 },
            { name: '바나나', price: 1000, desc: '달디단 바나나', stock: 7 },
            { name: '메론', price: 1000, desc: '달디단 메론', stock: 5 },
            { name: '수박', price: 2000, desc: '달디단 수박', stock: 15 },
            { name: '브로콜리', price: 1000, desc: '달디단 브로콜리', stock: 5 },
        ];

        await this.productRepository.save(data);
        return true;
    }

    async getProductsInfo(productIds: string[]) {
        return await this.productRepository.find({
            where: {
                id: In(productIds),
            },
        });
    }
}
