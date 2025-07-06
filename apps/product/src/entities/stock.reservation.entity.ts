import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryEntity } from './inventory.entity';

@Entity('stock_reservation')
export class StockReservationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => InventoryEntity)
    inventory: InventoryEntity;

    @Column('int')
    reservedQty: number;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    orderId?: string;

    @CreateDateColumn()
    createdAt: Date;
}
