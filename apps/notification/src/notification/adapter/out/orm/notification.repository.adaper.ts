import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entity/notification.entity';
import { Repository } from 'typeorm';
import { NotificationRepositoryOutPort } from '../../../port/out/notification.repostiroy.out.port';
import { NotificationDomain } from '../../../domain/notification.domain';
import { NotificationeEntityMapper } from '../../../mapper/notification.entity.mapper';

export class NotificationRepositoryAdapter
    implements NotificationRepositoryOutPort
{
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
    ) {}

    async createNotification(
        notification: NotificationDomain,
    ): Promise<NotificationDomain> {
        const result = await this.notificationRepository
            .createQueryBuilder()
            .insert()
            .values(notification)
            .execute();
        const id = result.identifiers[0].id;
        const notificationEntity = await this.notificationRepository.findOneBy({
            id,
        });

        return new NotificationeEntityMapper(notificationEntity).toDomain();
    }

    async updateNotification(
        notification: NotificationDomain,
    ): Promise<NotificationDomain> {
        await this.notificationRepository
            .createQueryBuilder()
            .update()
            .set({
                ...notification,
            })
            .where('id = :id', { id: notification.id })
            .execute();
        return this.findNotificationById(notification.id);
    }

    async findNotificationById(id: string): Promise<NotificationDomain> {
        const result = await this.notificationRepository.findOne({
            where: { id: id },
        });
        return new NotificationeEntityMapper(result).toDomain();
    }
}
