import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_stock')
@Unique(['productId'])
export class ProductStockEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    quantity: number;

    @Column()
    productId: number;

    @ManyToOne(() => ProductEntity, product => product.stock)
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;
}
