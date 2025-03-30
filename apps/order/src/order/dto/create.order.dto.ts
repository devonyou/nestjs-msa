import { PaymentMethod } from '../domain/payment.domain';

export interface AddressDto {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface PaymentDto {
    paymentMethod: PaymentMethod;
    paymentName: string;
    cardNumber: string;
    expiryYear: string;
    expiryMonth: string;
    birthOfRegistration: string;
    passwordTwoDigit: string;
    amount: number;
}

export interface CreateOrderDto {
    userId: string;
    productIds: string[];
    address: AddressDto;
    payment: PaymentDto;
}
