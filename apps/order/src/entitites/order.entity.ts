import { OrderMicroService } from '@app/common';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItemEntity } from './order.item.entity';

@Entity('order')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @OneToMany(() => OrderItemEntity, item => item.order, { cascade: true })
    items: OrderItemEntity[];

    @Column({ type: 'enum', enum: OrderMicroService.OrderStatus, default: OrderMicroService.OrderStatus.CREATED })
    status: OrderMicroService.OrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ nullable: true })
    paymentId?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
