import { TestBed } from '@automock/jest';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { ProductMicroService } from '@app/common';
import { ProductStockEntity } from '../../entities/product.stock.entity';
import { ProductEntity } from '../../entities/product.entity';
import { StockResponseMapper } from './mapper/stock.response.mapper';
import { ProductStockReservationEntity } from '../../entities/product.stock.reservation.entity';
import { StockReservationStatus } from '@app/common/grpc/proto/product';
import { StockReservationResponseMapper } from './mapper/stock.reservation.response.mapper';

describe('StockController', () => {
    let stockController: StockController;
    let mockStockService: jest.Mocked<StockService>;

    const mockStockResponse: ProductMicroService.StockResponse = {
        id: 1,
        quantity: 10,
        product: {
            id: 1,
            name: 'Product',
            description: 'Description',
            price: 0,
            images: [],
            category: undefined,
            stock: undefined,
            createdAt: '',
            updatedAt: '',
        },
    };

    const mockStockReservationResponse: ProductMicroService.StockReservationResponse = {
        id: 1,
        productId: 1,
        reservedQty: 10,
        expiresAt: new Date().toISOString(),
        orderId: '1',
        status: StockReservationStatus.PENDING,
    };

    beforeEach(() => {
        const { unit, unitRef } = TestBed.create(StockController).compile();

        stockController = unit;
        mockStockService = unitRef.get(StockService);

        jest.spyOn(StockResponseMapper, 'toStockResponse').mockReturnValue(mockStockResponse);
        jest.spyOn(StockReservationResponseMapper, 'toStockReservationResponse').mockReturnValue(
            mockStockReservationResponse,
        );
    });

    describe('getStockByProductId', () => {
        it('should return a stock by product id', async () => {
            const request: ProductMicroService.GetStockByProductIdRequest = {
                productId: 1,
            };

            const stock: ProductStockEntity = {
                id: 1,
                quantity: 10,
                product: new ProductEntity(),
                productId: 0,
            };

            // mock
            jest.spyOn(mockStockService, 'getStockByProductId').mockResolvedValue(stock);

            const result = await stockController.getStockByProductId(request);

            // expect
            expect(mockStockService.getStockByProductId).toHaveBeenCalledWith(request.productId);
            expect(result).toEqual(StockResponseMapper.toStockResponse(stock));
        });
    });

    describe('upsertStock', () => {
        it('should upsert a stock', async () => {
            const request: ProductMicroService.UpsertStockQuantityRequest = {
                productId: 1,
                quantity: 10,
            };

            const stock: ProductStockEntity = {
                id: 1,
                quantity: 10,
                product: new ProductEntity(),
                productId: 0,
            };

            // mock
            jest.spyOn(mockStockService, 'upsertStock').mockResolvedValue(stock);

            const result = await stockController.upsertStock(request);

            // expect
            expect(mockStockService.upsertStock).toHaveBeenCalledWith(request);
            expect(result).toEqual(StockResponseMapper.toStockResponse(stock));
        });
    });

    describe('createStockReservation', () => {
        it('should create a stock reservation', async () => {
            const request: ProductMicroService.CreateStockReservationRequest = {
                orderId: '1',
                reservations: [
                    {
                        productId: 1,
                        reservedQty: 10,
                    },
                ],
            };

            const stockReservation: ProductStockReservationEntity = {
                id: 1,
                product: new ProductEntity(),
                reservedQty: 10,
                expiresAt: new Date(),
                orderId: '1',
                status: StockReservationStatus.PENDING,
                createdAt: new Date(),
            };

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
        it('should confirm a stock reservation', async () => {
            const request: ProductMicroService.ConfirmStockReservationRequest = {
                orderId: '1',
            };

            const stockReservation: ProductStockReservationEntity = {
                id: 1,
                product: new ProductEntity(),
                reservedQty: 10,
                expiresAt: new Date(),
                orderId: '1',
                status: StockReservationStatus.PENDING,
                createdAt: undefined,
            };

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
        it('should restore a stock reservation', async () => {
            const request: ProductMicroService.RestoreStockReservationRequest = {
                orderId: '1',
            };

            const stockReservation: ProductStockReservationEntity = {
                id: 1,
                product: new ProductEntity(),
                reservedQty: 10,
                expiresAt: new Date(),
                orderId: '1',
                status: StockReservationStatus.PENDING,
                createdAt: undefined,
            };

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
