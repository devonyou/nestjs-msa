import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_image')
export class ProductImageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, product => product.images)
    product: ProductEntity;

    @Column()
    url: string;

    @Column({ nullable: true })
    altText?: string;

    @Column({ default: false })
    isMain: boolean;
}
