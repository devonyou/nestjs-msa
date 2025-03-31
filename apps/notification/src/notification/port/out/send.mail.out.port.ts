import { NotificationDomain } from '../../domain/notification.domain';

export interface SendMailOutPort {
    sendMail(notification: NotificationDomain): Promise<boolean>;
}
