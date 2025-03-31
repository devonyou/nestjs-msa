export enum NotificationStatus {
    pending = 'Pending',
    sent = 'Sent',
}

export class NotificationDomain {
    id: string;
    to: string;
    from: string;
    subject: string;
    content: string;
    status: NotificationStatus;

    constructor(
        params: Pick<NotificationDomain, 'to' | 'subject' | 'content' | 'from'>,
    ) {
        this.to = params.to;
        this.subject = params.subject;
        this.content = params.content;
        this.from = params.from;
    }

    setId(id: string) {
        this.id = id;
    }

    setStatus(status: NotificationStatus) {
        if (!this.id) throw new Error('ID가 없는 알림입니다.');
        this.status = status;
    }

    pending() {
        this.status = NotificationStatus.pending;
    }

    sent() {
        if (!this.id) throw new Error('ID가 없는 알림입니다.');
        this.status = NotificationStatus.sent;
    }
}
