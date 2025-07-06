import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryEntity } from './inventory.entity';

@Entity('inventory_log')
export class InventoryLogEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => InventoryEntity, inventory => inventory.logs)
    inventory: InventoryEntity;

    @Column()
    changeType: 'IN' | 'OUT' | 'RESERVED' | 'CANCELLED'; // 입고, 출고 등

    @Column('int')
    quantityChanged: number;

    @Column({ nullable: true })
    reason?: string;

    @CreateDateColumn()
    createdAt: Date;
}
