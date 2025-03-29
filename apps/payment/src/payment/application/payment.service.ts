import { Inject, Injectable } from '@nestjs/common';
import { NetworkOutputPort } from '../port/output/network.output.port';
import { PaymentOutputPort } from '../port/output/payment.output.port';
import { DatabaseOutputPort } from '../port/output/database.output.port';
import { PaymentModel } from '../domain/payment.model';

@Injectable()
export class PaymentService {
    constructor(
        @Inject('DatabaseOutputPort')
        private readonly databaseOutputPort: DatabaseOutputPort,
        @Inject('PaymentOutputPort')
        private readonly paymentOutputPort: PaymentOutputPort,
        @Inject('NetworkOutputPort')
        private readonly networkOutputPort: NetworkOutputPort,
    ) {}

    async createPayment(param) {
        // 1. params로 PaymentModel을 생성 -> domain
        const payment = new PaymentModel(param);

        // 2. PaymentModel을 저장 -> database output port
        const result = await this.databaseOutputPort.savePayment(payment);

        // 3. 저장된 데이터의 ID를 PaymentModel에 저장
        payment.setId(result.id);

        try {
            // 4. 결제를 실행 > HTTP output port
            await this.paymentOutputPort.processPayment(payment);

            // 5. 결제 데이터를 업데이트 -> database output port
            payment.processPayment();
            await this.databaseOutputPort.updatePayment(payment);
        } catch (err) {
            // 7. 실패 시 (4, 5) 결제를 reject -> database, domain
            payment.rejectPayment();
            await this.databaseOutputPort.updatePayment(payment);

            return payment;
        }

        // 6. 알림 > grpc output port
        await this.networkOutputPort.sendNotification(
            param.orderId,
            param.userEmail,
        );

        return payment;
    }
}
