import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductStockEntity } from './product.stock.entity';

@Entity('product_stock_reservation')
export class ProductStockReservationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductStockEntity)
    stock: ProductStockEntity;

    @Column('int')
    reservedQty: number;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    orderId?: string;

    @CreateDateColumn()
    createdAt: Date;
}
