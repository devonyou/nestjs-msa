import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentEntity } from './adapter/output/typeorm/entity/payment.entity';
import { GrpcAdapter } from './adapter/output/grpc/grpc.adapter';
import { PortoneAdapter } from './adapter/output/portone/portone.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import {
    PaymentDocument,
    PaymentSchema,
} from './adapter/output/mongoose/entity/payment.document';
import { PaymentService } from './application/payment.service';
import { TypeormAdapter } from './adapter/output/typeorm/typeorm.adapter';
import { MongooseAdapter } from './adapter/output/mongoose/mongoose.adapter';
import { PaymentController } from './adapter/input/payment.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentEntity]),
        MongooseModule.forFeature([
            { name: PaymentDocument.name, schema: PaymentSchema },
        ]),
    ],
    controllers: [PaymentController],
    providers: [
        PaymentService,
        // { provide: 'DatabaseOutputPort', useClass: TypeormAdapter },
        { provide: 'DatabaseOutputPort', useClass: MongooseAdapter },
        { provide: 'NetworkOutputPort', useClass: GrpcAdapter },
        { provide: 'PaymentOutputPort', useClass: PortoneAdapter },
    ],
})
export class PaymentModule {}
