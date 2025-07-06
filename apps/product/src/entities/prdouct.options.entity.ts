import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_option')
export class ProductOptionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, product => product.options)
    product: ProductEntity;

    @Column()
    name: string;

    @Column('decimal', { default: 0 })
    additionalPrice: number;
}
