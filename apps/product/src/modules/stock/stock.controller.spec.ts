import { TestBed } from '@automock/jest';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { ProductMicroService } from '@app/common';
import { ProductStockEntity } from '../../entities/product.stock.entity';
import { StockResponseMapper } from './mapper/stock.response.mapper';
import { ProductStockReservationEntity } from '../../entities/product.stock.reservation.entity';
import { StockReservationResponseMapper } from './mapper/stock.reservation.response.mapper';

describe('StockController', () => {
    let stockController: StockController;
    let mockStockService: jest.Mocked<StockService>;
    let mockStockResponse: ProductMicroService.StockResponse;
    let mockStockReservationResponse;

    beforeEach(() => {
        const { unit, unitRef } = TestBed.create(StockController).compile();

        stockController = unit;
        mockStockService = unitRef.get(StockService);

        mockStockResponse = StockResponseMapper.toStockResponse(new ProductStockEntity());
        mockStockReservationResponse = StockReservationResponseMapper.toStockReservationResponse(
            new ProductStockReservationEntity(),
        );

        jest.spyOn(StockResponseMapper, 'toStockResponse').mockReturnValue(mockStockResponse);
        jest.spyOn(StockReservationResponseMapper, 'toStockReservationResponse').mockReturnValue(
            mockStockReservationResponse,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getStockByProductId', () => {
        const request: ProductMicroService.GetStockByProductIdRequest = {
            productId: 1,
        };

        it('should return a stock by product id', async () => {
            const stock = new ProductStockEntity();

            // mock
            jest.spyOn(mockStockService, 'getStockByProductId').mockResolvedValue(stock);

            const result = await stockController.getStockByProductId(request);

            // expect
            expect(mockStockService.getStockByProductId).toHaveBeenCalledWith(request.productId);
            expect(result).toEqual(StockResponseMapper.toStockResponse(stock));
        });
    });

    describe('upsertStock', () => {
        const request: ProductMicroService.UpsertStockQuantityRequest = {
            productId: 1,
            quantity: 10,
        };
        it('should upsert a stock', async () => {
            const stock = new ProductStockEntity();

            // mock
            jest.spyOn(mockStockService, 'upsertStock').mockResolvedValue(stock);

            const result = await stockController.upsertStock(request);

            // expect
            expect(mockStockService.upsertStock).toHaveBeenCalledWith(request);
            expect(result).toEqual(StockResponseMapper.toStockResponse(stock));
        });
    });

    describe('createStockReservation', () => {
        const request: ProductMicroService.CreateStockReservationRequest = {
            orderId: '1',
            reservations: [
                {
                    productId: 1,
                    reservedQty: 10,
                },
            ],
        };

        it('should create a stock reservation', async () => {
            const stockReservation = new ProductStockReservationEntity();

            // mock
            jest.spyOn(mockStockService, 'createStockReservation').mockResolvedValue([stockReservation]);

            const result = await stockController.createStockReservation(request);

            // expect
            expect(mockStockService.createStockReservation).toHaveBeenCalledWith(request);
            expect(result).toEqual({
                reservations: [StockReservationResponseMapper.toStockReservationResponse(stockReservation)],
            });
        });
    });

    describe('confirmStockReservation', () => {
        const request: ProductMicroService.ConfirmStockReservationRequest = {
            orderId: '1',
        };

        it('should confirm a stock reservation', async () => {
            const stockReservation = new ProductStockReservationEntity();

            // mock
            jest.spyOn(mockStockService, 'confirmStockReservation').mockResolvedValue([stockReservation]);

            const result = await stockController.confirmStockReservation(request);

            // expect
            expect(mockStockService.confirmStockReservation).toHaveBeenCalledWith(request);
            expect(result).toEqual({
                reservations: [StockReservationResponseMapper.toStockReservationResponse(stockReservation)],
            });
        });
    });

    describe('restoreStockReservation', () => {
        const request: ProductMicroService.RestoreStockReservationRequest = {
            orderId: '1',
        };
        it('should restore a stock reservation', async () => {
            const stockReservation = new ProductStockReservationEntity();

            // mock
            jest.spyOn(mockStockService, 'restoreStockReservation').mockResolvedValue([stockReservation]);

            const result = await stockController.restoreStockReservation(request);

            // expect
            expect(mockStockService.restoreStockReservation).toHaveBeenCalledWith(request);
            expect(result).toEqual({
                reservations: [StockReservationResponseMapper.toStockReservationResponse(stockReservation)],
            });
        });
    });
});
