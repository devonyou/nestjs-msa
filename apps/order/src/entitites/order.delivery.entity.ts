import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_delivery')
export class OrderDeliveryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    postCode: string;

    @Column()
    street: string;

    @OneToOne(() => OrderEntity, order => order.delivery, { onDelete: 'CASCADE' })
    @JoinColumn()
    order: OrderEntity;
}
