import { PaymentMicroService } from '@app/common';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payment')
export class PaymentEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    orderId: string;

    @Column({ type: 'int' })
    userId: number;

    @Column({ type: 'int' })
    amount: number;

    @Column({
        type: 'int',
        default: PaymentMicroService.PaymentStatus.PENDING,
    })
    status: PaymentMicroService.PaymentStatus;

    @Column()
    provider: string;

    @Column({ nullable: true })
    providerPaymentId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
