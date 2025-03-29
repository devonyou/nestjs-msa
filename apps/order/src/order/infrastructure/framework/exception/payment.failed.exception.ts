import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class PaymentFailedException extends HttpException {
    constructor(message?: any) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
