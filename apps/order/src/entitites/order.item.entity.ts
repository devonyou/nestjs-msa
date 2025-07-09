import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_item')
export class OrderItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => OrderEntity, order => order.items)
    order: OrderEntity;

    @Column()
    productId: string;

    @Column()
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
}
