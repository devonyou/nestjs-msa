import { Module } from '@nestjs/common';
import { SendNotificationUsecase } from './usecase/send.notification.usecase';
import { NotificationRepositoryAdapter } from './adapter/out/orm/notification.repository.adaper';
import { SendMailAdapter } from './adapter/out/smtp/send.mail.adapter';
import { OrderGrpcAdapter } from './adapter/out/grpc/order.grpc.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './adapter/out/orm/entity/notification.entity';
import { NotificationController } from './adapter/in/notification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationEntity])],
    controllers: [NotificationController],
    providers: [
        SendNotificationUsecase,
        {
            provide: 'NotificationRepositoryOutPort',
            useClass: NotificationRepositoryAdapter,
        },
        { provide: 'SendMailOutPort', useClass: SendMailAdapter },
        { provide: 'OrderGrpcOutPort', useClass: OrderGrpcAdapter },
    ],
})
export class NotificationModule {}
