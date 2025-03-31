import { NotificationDomain } from '../../domain/notification.domain';

export interface NotificationRepositoryOutPort {
    createNotification(
        notification: NotificationDomain,
    ): Promise<NotificationDomain>;

    updateNotification(
        notification: NotificationDomain,
    ): Promise<NotificationDomain>;

    findNotificationById(id: string): Promise<NotificationDomain>;
}
