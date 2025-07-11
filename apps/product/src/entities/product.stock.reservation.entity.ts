import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductMicroService } from '@app/common';
import { ProductEntity } from './product.entity';

@Entity('product_stock_reservation')
export class ProductStockReservationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;

    @Column('int')
    reservedQty: number;

    @Column()
    expiresAt: Date;

    @Column()
    orderId: string;

    @Column({
        type: 'int',
        default: ProductMicroService.StockReservationStatus.PENDING,
    })
    status: ProductMicroService.StockReservationStatus;

    @CreateDateColumn()
    createdAt: Date;
}
