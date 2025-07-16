import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService, UserMicroService } from '@app/common';
import { UserEntity } from '../../entities/user.entity';
import { GoogleProfileDto } from './dto/google.profile.dto';
import { GrpcUnauthenticatedException } from 'nestjs-grpc-exceptions';

const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
};

const mockDataSource = {
    getRepository: jest
        .fn(entity => {
            if (entity === UserEntity) return mockUserRepository;
        })
        .mockReturnValue(mockUserRepository),
};

const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
};

const mockConfigService = {
    getOrThrow: jest.fn(),
};

const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
    ttl: jest.fn(),
    del: jest.fn(),
};

describe('UserService', () => {
    let userService: UserService;

    const userInfo: GoogleProfileDto = {
        provider: 'google',
        providerId: '1234',
        email: 'test@example.com',
        name: 'onyou.code',
        avatarUrl: 'https://example.com/avatar.png',
        emailVerified: true,
    };

    const payload = {
        sub: 1,
        version: 1,
        role: UserMicroService.UserRole.USER,
        type: 'access',
        name: userInfo.name,
        email: userInfo.email,
        avatarUrl: userInfo.avatarUrl,
    };

    const cachedUser: UserEntity = {
        ...payload,
        id: payload.sub,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: userInfo.provider,
        providerId: userInfo.providerId,
        emailVerified: userInfo.emailVerified,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: DataSource, useValue: mockDataSource },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: RedisService, useValue: mockRedisService },
            ],
        }).compile();

        userService = module.get<UserService>(UserService);
    });

    // findOrCreateUserByGoogle
    describe('findOrCreateUserByGoogle', () => {
        it('should create new user if not found', async () => {
            // findOne mock
            mockUserRepository.findOne.mockResolvedValue(null);

            // create mock
            const createdUser = { ...userInfo, role: UserMicroService.UserRole.USER };
            mockUserRepository.create.mockReturnValue(createdUser);
            mockUserRepository.save.mockResolvedValue({ id: 'user-id', ...createdUser });

            // expect
            const result = await userService.findOrCreateUserByGoogle(userInfo);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { provider: 'google', providerId: '1234' },
            });
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                ...userInfo,
                role: UserMicroService.UserRole.USER,
            });
            expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
            expect(result).toEqual({ id: 'user-id', ...createdUser });
        });

        it('should create new user if not null', async () => {
            // findOne mock
            mockUserRepository.findOne.mockResolvedValue(userInfo);

            // expect
            const result = await userService.findOrCreateUserByGoogle(userInfo);
            expect(result).toEqual(userInfo);
        });
    });

    // getUserInfoByUserId
    describe('getUserInfoByUserId', () => {
        it('should return a user info by userId', async () => {
            // findOne mock
            jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue({ id: 1, ...userInfo });

            // expect
            const result = await userService.getUserInfoByUserId(1);
            expect(result).toEqual({ id: 1, ...userInfo });
            expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
        });
    });

    describe('updateUserInfo', () => {
        it('should update user info', async () => {
            const id = 1;

            // update mock
            jest.spyOn(mockUserRepository, 'update').mockResolvedValue(undefined);
            jest.spyOn(userService, 'getUserInfoByUserId').mockResolvedValue({ id, ...userInfo } as UserEntity);
            jest.spyOn(userService, 'setUserInfoToCache').mockResolvedValue(undefined);

            // expect
            const result = await userService.updateUserInfo({ id, ...userInfo });
            expect(result).toEqual({ id, ...userInfo });
            expect(mockUserRepository.update).toHaveBeenCalledWith(id, { id, ...userInfo });
            expect(userService.getUserInfoByUserId).toHaveBeenCalledWith(id);
            expect(userService.setUserInfoToCache).toHaveBeenCalledWith(result);
        });

        it('should throw GrpcUnauthenticatedException if user not found', async () => {
            const id = 1;

            jest.spyOn(mockUserRepository, 'update').mockResolvedValue(undefined);
            jest.spyOn(userService, 'getUserInfoByUserId').mockResolvedValue(null);

            await expect(userService.updateUserInfo({ id, ...userInfo })).rejects.toThrow(GrpcUnauthenticatedException);
            expect(mockUserRepository.update).toHaveBeenCalledWith(id, { id, ...userInfo });
            expect(userService.getUserInfoByUserId).toHaveBeenCalledWith(id);
        });
    });

    // signInWithGoogle
    describe('signInWithGoogle', () => {
        it('should return accessToken and refreshToken', async () => {
            const user = { id: 1, ...userInfo };
            const tokens = { accessToken: 'accessToken', refreshToken: 'refreshToken' };

            // mock
            jest.spyOn(userService, 'issueTokenByUserId').mockResolvedValue(tokens);

            // expect
            const result = await userService.signInWithGoogle(user as UserEntity);
            expect(result).toEqual(tokens);
            expect(userService.issueTokenByUserId).toHaveBeenCalledWith(user.id);
        });

        it('should throw GrpcUnauthenticatedException if issueTokenByUserId throws', async () => {
            const user = { id: 1, ...userInfo };

            // mock
            jest.spyOn(userService, 'issueTokenByUserId').mockRejectedValue(new Error('test'));

            // expect
            await expect(userService.signInWithGoogle(user as UserEntity)).rejects.toThrow(
                GrpcUnauthenticatedException,
            );
            expect(userService.issueTokenByUserId).toHaveBeenCalledWith(user.id);
        });

        // issueTokenByUserId
        describe('issueTokenByUserId', () => {
            it('should return accessToken and refreshToken', async () => {
                const user = { id: 1, ...userInfo };
                const tokens = { accessToken: 'accessToken', refreshToken: 'refreshToken' };

                // mock
                jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user as UserEntity);
                jest.spyOn(userService, 'deleteUserInfoFromCache').mockResolvedValue(undefined);
                jest.spyOn(userService, 'issueToken')
                    .mockResolvedValueOnce(tokens.accessToken)
                    .mockResolvedValueOnce(tokens.refreshToken);

                // expect
                const result = await userService.issueTokenByUserId(user.id);
                expect(result).toEqual(tokens);
                expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
                expect(userService.deleteUserInfoFromCache).toHaveBeenCalledWith(user.id);
                expect(userService.issueToken).toHaveBeenNthCalledWith(1, user, false);
                expect(userService.issueToken).toHaveBeenNthCalledWith(2, user, true);
            });

            it('should throw GrpcUnauthenticatedException if user not found', async () => {
                const user = { id: 1, ...userInfo };

                // mock
                jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
                jest.spyOn(userService, 'deleteUserInfoFromCache').mockResolvedValue(undefined);

                // expect
                await expect(userService.issueTokenByUserId(user.id)).rejects.toThrow(GrpcUnauthenticatedException);
                expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
            });
        });
    });

    // issueToken
    describe('issueToken', () => {
        it('should return accessToken', async () => {
            const user: UserEntity = {
                ...userInfo,
                id: 1,
                role: UserMicroService.UserRole.USER,
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const token = 'token';
            const isRefresh = false;

            // mock
            jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(token);

            // expect
            const result = await userService.issueToken(user, isRefresh);
            expect(result).toEqual(token);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
                secret: userService['accessSecret'],
                expiresIn: userService['accessExpireIn'],
            });
        });

        it('should return refreshToken', async () => {
            const user = { id: 1, ...userInfo, role: UserMicroService.UserRole.USER, version: 1 };
            const token = 'token';
            const isRefresh = true;

            // mock
            jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(token);

            // expect
            const result = await userService.issueToken(user as UserEntity, isRefresh);
            expect(result).toEqual(token);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith(
                {
                    ...payload,
                    type: 'refresh',
                },
                {
                    secret: userService['refreshSecret'],
                    expiresIn: userService['refreshExpireIn'],
                },
            );
        });

        // verifyToken
        describe('verifyToken', () => {
            it('should return user info if refresh token', async () => {
                const rawToken = 'rawToken';
                const isRefresh = true;

                // mock
                jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(payload);
                jest.spyOn(userService, 'deleteUserInfoFromCache').mockResolvedValue(undefined);

                // expect
                const result = await userService.verifyToken(rawToken, isRefresh);
                expect(result).toEqual({ verify: true, user: { ...payload, id: payload.sub } });
                expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(rawToken, {
                    secret: userService['accessSecret'],
                    ignoreExpiration: false,
                });
            });

            it('should return cached user info if access token', async () => {
                const rawToken = 'rawToken';
                const isRefresh = false;

                // mock
                jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(payload);
                jest.spyOn(userService, 'getUserInfoFromCache').mockResolvedValue(cachedUser);

                // expect
                const result = await userService.verifyToken(rawToken, isRefresh);
                expect(result).toEqual({ verify: true, user: cachedUser });
            });

            it('should return database user if not found cached user', async () => {
                const rawToken = 'rawToken';
                const isRefresh = false;
                const payload = {
                    ...userInfo,
                    sub: 1,
                    role: UserMicroService.UserRole.USER,
                    version: 2,
                };
                const cachedUser = null;

                // mock
                jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(payload);
                jest.spyOn(userService, 'getUserInfoFromCache').mockResolvedValue(cachedUser);
                jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue({ ...payload, id: payload.sub });

                // expect
                const result = await userService.verifyToken(rawToken, isRefresh);
                expect(result).toEqual({ verify: true, user: { ...payload, id: payload.sub } });
                expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(rawToken, {
                    secret: userService['accessSecret'],
                    ignoreExpiration: false,
                });
            });

            it('should throw GrpcUnauthenticatedException if verifyToken throws', async () => {
                const rawToken = 'rawToken';
                const isRefresh = false;

                // mock
                jest.spyOn(mockJwtService, 'verifyAsync').mockRejectedValue(GrpcUnauthenticatedException);

                // expect
                await expect(userService.verifyToken(rawToken, isRefresh)).rejects.toThrow(
                    GrpcUnauthenticatedException,
                );
                expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(rawToken, {
                    secret: userService['accessSecret'],
                    ignoreExpiration: false,
                });
            });

            it('should throw GrpcUnauthenticatedException if user not found', async () => {
                const rawToken = 'rawToken';
                const isRefresh = false;

                // mock
                jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(payload);
                jest.spyOn(userService, 'getUserInfoFromCache').mockResolvedValue(null);
                jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

                // expect
                await expect(userService.verifyToken(rawToken, isRefresh)).rejects.toThrow(
                    GrpcUnauthenticatedException,
                );
                expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(rawToken, {
                    secret: userService['accessSecret'],
                    ignoreExpiration: false,
                });
            });

            it('should throw GrpcUnauthenticatedException if user version is not matched', async () => {
                const rawToken = 'rawToken';
                const isRefresh = false;
                const version = 2;

                // mock
                jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(payload);
                jest.spyOn(userService, 'getUserInfoFromCache').mockResolvedValue({
                    ...cachedUser,
                    version,
                });

                // expect
                await expect(userService.verifyToken(rawToken, isRefresh)).rejects.toThrow(
                    GrpcUnauthenticatedException,
                );
                expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(rawToken, {
                    secret: userService['accessSecret'],
                    ignoreExpiration: false,
                });
            });
        });
    });

    // setUserInfoToCache
    describe('setUserInfoToCache', () => {
        it('should set user to cache with computed ttl when payloadExp is provided', async () => {
            const user = { id: 1, name: '온유' } as UserEntity;
            const now = Math.floor(Date.now() / 1000);
            const payloadExp = now + 60 * 10;
            const expectedTtl = payloadExp - now - 5 * 60;

            // mock
            jest.spyOn(global.Date, 'now').mockReturnValue(now * 1000);
            const redisSetSpy = jest.spyOn(mockRedisService, 'set').mockResolvedValue(undefined);

            // expect
            await userService.setUserInfoToCache(user, payloadExp);
            expect(redisSetSpy).toHaveBeenCalledWith(`user:payload:${user.id}`, user, expectedTtl);
        });
    });

    // getUserInfoFromCache
    describe('getUserInfoFromCache', () => {
        it('should return user info from cache', async () => {
            const userId = cachedUser.id;

            // mock
            jest.spyOn(mockRedisService, 'get').mockResolvedValue(cachedUser);

            // expect
            const result = await userService.getUserInfoFromCache(userId);
            expect(result).toEqual(cachedUser);
            expect(mockRedisService.get).toHaveBeenCalledWith(`user:payload:${userId}`);
        });
    });

    // deleteUserInfoFromCache
    describe('deleteUserInfoFromCache', () => {
        it('should delete user info from cache', async () => {
            const userId = cachedUser.id;

            // mock
            jest.spyOn(mockRedisService, 'del').mockResolvedValue(undefined);

            // expect
            await userService.deleteUserInfoFromCache(userId);
            expect(mockRedisService.del).toHaveBeenCalledWith(`user:payload:${userId}`);
        });
    });
});
