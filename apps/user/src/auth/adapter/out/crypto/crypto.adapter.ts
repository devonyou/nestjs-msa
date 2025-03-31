import { CryptoPort } from '../../../port/out/crypto.port';
import * as bcrypt from 'bcrypt';

export class CryptoAdapter implements CryptoPort {
    hash(password: any): string {
        return bcrypt.hashSync(password, 10);
    }

    compare(hashedPassword: string, password: string): Promise<boolean> {
        return bcrypt.compare(hashedPassword, password);
    }
}
