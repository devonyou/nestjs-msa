import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductCategoryEntity } from './product.category.entity';
import { ProductImageEntity } from './product.image.entity';
import { ProductOptionEntity } from './prdouct.options.entity';

@Entity('product')
export class ProductEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column('decimal')
    price: number;

    @Column('int')
    stock: number;

    @ManyToOne(() => ProductCategoryEntity, category => category.products)
    category: ProductCategoryEntity;

    @OneToMany(() => ProductImageEntity, image => image.product)
    images: ProductImageEntity[];

    @OneToMany(() => ProductOptionEntity, option => option.product)
    options: ProductOptionEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
