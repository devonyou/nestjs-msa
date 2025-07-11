import { Injectable } from '@nestjs/common';
import { GoogleProfileDto } from './dto/google.profile.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { GrpcUnauthenticatedException } from 'nestjs-grpc-exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService, UserMicroService } from '@app/common';

@Injectable()
export class UserService {
    private accessSecret: string;
    private refreshSecret: string;
    private accessExpireIn: number;
    private refreshExpireIn: number;

    constructor(
        @InjectDataSource() private readonly datasource: DataSource,

        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) {
        this.accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET_KEY');
        this.refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET_KEY');
        this.accessExpireIn = this.configService.getOrThrow<number>('JWT_ACCESS_EXPIRATION_TIME');
        this.refreshExpireIn = this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRATION_TIME');
    }

    /**
     * 구글 프로필을 기반으로 사용자를 찾거나 생성
     * @param userInfo 구글 프로필 정보
     * @returns 사용자 엔티티
     */
    async findOrCreateUserByGoogle(userInfo: GoogleProfileDto): Promise<UserEntity> {
        const user = await this.datasource.getRepository(UserEntity).findOne({
            where: {
                provider: userInfo.provider,
                providerId: userInfo.providerId,
            },
        });

        if (!user) {
            const newUser = this.datasource.getRepository(UserEntity).create({
                ...userInfo,
                role: UserMicroService.UserRole.USER,
            });
            return this.datasource.getRepository(UserEntity).save(newUser);
        }

        return user;
    }

    /**
     * 구글 로그인
     * @param user UserEntity
     * @returns { accessToken: string; refreshToken: string }
     */
    async signInWithGoogle(user: UserEntity): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            return await this.issueTokenByUserId(user.id);
        } catch (error) {
            throw new GrpcUnauthenticatedException(error.message);
        }
    }

    /**
     * 사용자 ID를 기반으로 토큰을 발행
     * @param userId 사용자 ID
     * @param isRefresh 리프레시 토큰 여부
     * @returns 액세스 토큰 또는 리프레시 토큰
     */
    async issueTokenByUserId(userId: number): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const user = await this.datasource.getRepository(UserEntity).findOne({
            where: { id: userId },
        });

        // 토큰 발행 전 캐시된 사용자 정보 삭제
        await this.deleteUserInfoFromCache(userId);

        if (!user) {
            throw new GrpcUnauthenticatedException('사용자를 찾을수 없습니다.');
        }

        return {
            accessToken: await this.issueToken(user, false),
            refreshToken: await this.issueToken(user, true),
        };
    }

    /**
     * 토큰을 발행
     * @param user 사용자 정보
     * @param isRefresh 리프레시 토큰 여부
     * @returns 토큰
     */
    issueToken(user: UserEntity, isRefresh: boolean): Promise<string> {
        const payload = {
            sub: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            type: isRefresh ? 'refresh' : 'access',
            version: user.version,
        };

        return this.jwtService.signAsync(payload, {
            secret: isRefresh ? this.refreshSecret : this.accessSecret,
            expiresIn: isRefresh ? this.refreshExpireIn : this.accessExpireIn,
        });
    }

    /**
     * 토큰 검증
     * @param rawToken string
     * @param isRefresh boolean
     * @returns { verify: boolean; user: UserEntity }
     */
    async verifyToken(rawToken: string, isRefresh: boolean): Promise<{ verify: boolean; user: UserEntity }> {
        let payload;

        try {
            payload = await this.jwtService.verifyAsync(rawToken, {
                secret: isRefresh ? this.refreshSecret : this.accessSecret,
                ignoreExpiration: false,
            });
        } catch (err) {
            throw new GrpcUnauthenticatedException(err.message);
        }

        // refresh token 일 경우 토큰 검증 성공
        if (isRefresh) {
            return {
                verify: true,
                user: {
                    ...payload,
                    id: payload.sub,
                },
            };
        }

        // access token 일 경우 캐시된 사용자 정보 조회
        const cachedUser = await this.getUserInfoFromCache(payload.sub);

        // 캐시된 사용자 정보가 없을 경우 DB 사용자 정보 조회
        if (!cachedUser) {
            try {
                const user = await this.datasource.getRepository(UserEntity).findOne({
                    where: { id: payload.sub },
                });

                if (user) {
                    await this.setUserInfoToCache(user, payload.exp);
                    return { verify: true, user };
                } else {
                    throw new GrpcUnauthenticatedException('사용자 조회 실패');
                }
            } catch (err) {
                throw new GrpcUnauthenticatedException('토큰 검증 실패');
            }
        } else {
            // access token 일 경우 REDIS 사용자 정보 조회 후 버전 확인
            if (cachedUser.version !== payload.version) {
                throw new GrpcUnauthenticatedException('토큰 버전 불일치');
            }

            return { verify: true, user: cachedUser };
        }
    }

    /**
     * 사용자 정보를 캐시에 저장
     * @param user UserEntity
     * @param payloadExp number
     */
    async setUserInfoToCache(user: UserEntity, payloadExp?: number): Promise<void> {
        if (payloadExp) {
            const now = Math.floor(Date.now() / 1000);
            const ttl = payloadExp - now - 5 * 60;
            await this.redisService.set(`user:payload:${user.id}`, user, ttl);
        } else {
            const ttl = await this.redisService.ttl(`user:payload:${user.id}`);
            await this.redisService.set(`user:payload:${user.id}`, user, ttl);
        }
    }

    /**
     * 캐시에서 사용자 정보를 조회
     * @param userId number
     * @returns UserEntity | null
     */
    async getUserInfoFromCache(userId: number): Promise<UserEntity | null> {
        const cachedUser = await this.redisService.get(`user:payload:${userId}`);
        return cachedUser;
    }

    /**
     * 캐시에서 사용자 정보를 삭제
     * @param userId number
     */
    async deleteUserInfoFromCache(userId: number): Promise<void> {
        await this.redisService.del(`user:payload:${userId}`);
    }

    /**
     * 사용자 정보를 조회
     * @param userId number
     * @returns UserEntity
     */
    async getUserInfoByUserId(userId: number): Promise<UserEntity> {
        const user = await this.datasource.getRepository(UserEntity).findOneBy({ id: userId });
        return user;
    }

    /**
     * 사용자 정보를 업데이트
     * @param request UserMicroService.UpdateUserInfoRequest
     * @returns UserEntity
     */
    async updateUserInfo(request: UserMicroService.UpdateUserInfoRequest): Promise<UserEntity> {
        await this.datasource.getRepository(UserEntity).update(request.id, { ...request });

        const user = await this.getUserInfoByUserId(request.id);

        if (!user) {
            throw new GrpcUnauthenticatedException('사용자를 찾을수 없습니다.');
        }

        // 캐시 사용자 버전 업데이트
        await this.setUserInfoToCache(user);

        return user;
    }
}
