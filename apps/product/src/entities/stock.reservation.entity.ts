import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StockEntity } from './stock.entity';

@Entity('stock_reservation')
export class StockReservationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => StockEntity)
    stock: StockEntity;

    @Column('int')
    reservedQty: number;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    orderId?: string;

    @CreateDateColumn()
    createdAt: Date;
}
