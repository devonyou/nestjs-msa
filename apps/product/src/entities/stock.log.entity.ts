import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StockEntity } from './stock.entity';

type ChangeType = 'IN' | 'OUT' | 'RESERVED' | 'CANCELLED';

@Entity('stock_log')
export class StockLogEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    changeType: ChangeType;

    @Column('int')
    quantityChanged: number;

    @Column({ nullable: true })
    reason?: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => StockEntity, stock => stock.logs)
    stock: StockEntity;
}
