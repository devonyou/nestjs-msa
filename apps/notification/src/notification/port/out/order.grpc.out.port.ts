export interface OrderGrpcOutPort {
    deliveryStarted(orderId: string): Promise<boolean>;
}
