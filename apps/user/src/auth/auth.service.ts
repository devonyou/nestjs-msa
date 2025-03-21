import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        @InjectRepository(User) private readonly userRedpostiroy: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    async register(rawToken: string, dto: RegisterDto) {
        const { email, password } = this.parseBasicToken(rawToken);

        return await this.userService.create({
            ...dto,
            email,
            password,
        });
    }

    async login(rawToken: string) {
        const { email, password } = this.parseBasicToken(rawToken);

        const user = await this.authentication(email, password);
        return {
            refreshToken: await this.issueToken(user, true),
            accessToken: await this.issueToken(user, false),
        };
    }

    parseBasicToken(rawToken: string) {
        const [basic, token] = rawToken.split(' ');
        if (!basic || !token) {
            throw new BadRequestException('token format exception');
        }

        if (basic.toLocaleLowerCase() !== 'basic') {
            throw new BadRequestException('token format exception');
        }

        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [email, password] = decoded.split(':');
        if (!email || !password) {
            throw new BadRequestException('token format exception');
        }

        return {
            email,
            password,
        };
    }

    async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
        try {
            const [bearer, token] = rawToken.split(' ');
            if (!bearer || !token) throw new Error();
            if (bearer.toLowerCase() !== 'bearer') throw new Error();

            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>(isRefreshToken ? 'REFRESH_TOKEN_SECRET' : 'ACCESS_TOKEN_SECRET'),
            });

            if (payload.type !== 'refresh' && isRefreshToken) {
                throw new Error();
            } else if (payload.type !== 'access' && !isRefreshToken) {
                throw new Error();
            }

            return payload;
        } catch (err) {
            throw new UnauthorizedException('token format exception');
        }
    }

    async authentication(email: string, password: string) {
        const user = await this.userRedpostiroy.findOne({
            where: { email },
            select: { id: true, email: true, password: true },
        });

        if (!user) throw new BadRequestException('exception login');

        const passOk = await bcrypt.compare(password, user.password);
        if (!passOk) throw new BadRequestException('exception login');

        return user;
    }

    async issueToken(user, isRefreshToken: boolean) {
        const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');

        return this.jwtService.signAsync(
            {
                sub: user.id ?? user.sub,
                role: user.role,
                type: isRefreshToken ? 'refresh' : 'access',
            },
            {
                secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
                expiresIn: '24h',
            },
        );
    }
}
