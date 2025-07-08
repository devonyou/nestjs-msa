import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';
import { StockLogEntity } from './stock.log.entity';

@Entity('stock')
export class StockEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    stock: number;

    @ManyToOne(() => ProductEntity, { nullable: true })
    product: ProductEntity;

    @OneToMany(() => StockLogEntity, log => log.stock)
    logs: StockLogEntity[];
}
