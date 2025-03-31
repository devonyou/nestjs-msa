import { NotificationDomain } from '../../../domain/notification.domain';
import { SendMailOutPort } from '../../../port/out/send.mail.out.port';

export class SendMailAdapter implements SendMailOutPort {
    sendMail(notification: NotificationDomain): Promise<boolean> {
        return new Promise(resolve => setTimeout(() => resolve(true), 100));
    }
}
