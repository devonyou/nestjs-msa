import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_image')
export class ProductImageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column({ default: false })
    main: boolean;

    @ManyToOne(() => ProductEntity, product => product.images)
    product: ProductEntity;
}
