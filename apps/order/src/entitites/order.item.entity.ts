import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_item')
export class OrderItemEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => OrderEntity, order => order.items)
    order: OrderEntity;

    @Column()
    productId: number;

    @Column()
    productName: string;

    @Column()
    quantity: number;

    @Column({ type: 'int' })
    price: number;
}
