import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_category')
export class ProductCategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => ProductCategoryEntity, category => category.children)
    parent?: ProductCategoryEntity;

    @OneToMany(() => ProductCategoryEntity, category => category.parent)
    children: ProductCategoryEntity[];

    @OneToMany(() => ProductEntity, product => product.category)
    products: ProductEntity[];
}
