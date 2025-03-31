import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationStatus {
    pending = 'Pending',
    sent = 'Sent',
}

@Entity('notification')
export class NotificationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    from: string;

    @Column()
    to: string;

    @Column()
    subject: string;

    @Column()
    content: string;

    @Column()
    status: NotificationStatus;
}
