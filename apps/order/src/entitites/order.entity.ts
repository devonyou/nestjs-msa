import { OrderMicroService } from '@app/common';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { OrderItemEntity } from './order.item.entity';
import { OrderDeliveryEntity } from './order.delivery.entity';

@Entity('order')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    userId: number;

    @Column({ type: 'int' })
    amount: number;

    @Column({
        type: 'int',
        default: OrderMicroService.OrderStatus.PAYMENT_PENDING,
    })
    status: OrderMicroService.OrderStatus;

    @OneToMany(() => OrderItemEntity, item => item.order, { cascade: true })
    items: OrderItemEntity[];

    @OneToOne(() => OrderDeliveryEntity, delivery => delivery.order, { cascade: true })
    delivery: OrderDeliveryEntity;

    @Column({ nullable: true })
    paymentId?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
