import { ProductMicroService } from '@app/common';
import { ProductStockReservationEntity } from '../../../entities/product.stock.reservation.entity';

export class StockReservationResponseMapper {
    static toStockReservationResponse(
        reservation: ProductStockReservationEntity,
    ): ProductMicroService.StockReservationResponse {
        return {
            ...reservation,
            productId: reservation.product?.id,
            orderId: reservation.orderId,
            expiresAt: reservation.expiresAt && new Date(reservation.expiresAt).toISOString(),
        };
    }
}
