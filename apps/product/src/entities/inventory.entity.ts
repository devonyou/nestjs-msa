import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';
import { InventoryLogEntity } from './inventory.log.entity';

@Entity('inventory')
export class InventoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, { nullable: true })
    product: ProductEntity;

    @Column('int')
    quantity: number;

    @OneToMany(() => InventoryLogEntity, log => log.inventory)
    logs: InventoryLogEntity[];
}
