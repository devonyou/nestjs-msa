import {
    NotificationStatus,
    PaymentMethod,
    PaymentStatus,
} from '../../../../domain/payment.model';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.pending,
    })
    paymentStatus: PaymentStatus;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.creditCard,
    })
    paymentMethod: PaymentMethod;

    @Column()
    cardNumber: string;

    @Column()
    expiryYear: string;

    @Column()
    expiryMonth: string;

    @Column()
    birthOfRegistration: string;

    @Column()
    passwordTwoDigit: string;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.pending,
    })
    notificationStatus: NotificationStatus;

    @Column()
    orderId: string;

    @Column()
    amount: number;

    @Column()
    userEmail: string;
}
