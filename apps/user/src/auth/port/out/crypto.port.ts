export interface CryptoPort {
    hash(password: any): string;

    compare(hashedPassword: string, password: string): Promise<boolean>;
}
