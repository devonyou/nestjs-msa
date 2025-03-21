import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class PaymentCanceledException extends HttpException {
    constructor(message?: any) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
