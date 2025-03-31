import { NotificationEntity } from '../adapter/out/orm/entity/notification.entity';
import { NotificationDomain } from '../domain/notification.domain';

export class NotificationeEntityMapper {
    constructor(private readonly notificationEntity: NotificationEntity) {}

    toDomain(): NotificationDomain {
        const notification = new NotificationDomain({
            to: this.notificationEntity.to,
            subject: this.notificationEntity.subject,
            content: this.notificationEntity.content,
            from: this.notificationEntity.from,
        });
        notification.setId(this.notificationEntity.id);
        notification.setStatus(this.notificationEntity.status);
        return notification;
    }
}
