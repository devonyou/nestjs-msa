export interface NetworkOutputPort {
    sendNotification(orderId: string, userEmail: string): Promise<void>;
}
