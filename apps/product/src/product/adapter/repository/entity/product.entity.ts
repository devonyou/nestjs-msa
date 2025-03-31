import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product')
export class ProductEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    price: number;

    @Column()
    desc: string;

    @Column({ default: 0 })
    stock: number;
}
