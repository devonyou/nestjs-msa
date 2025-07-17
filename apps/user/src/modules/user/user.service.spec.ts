import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService, UserMicroService } from '@app/common';
import { UserEntity } from '../../entities/user.entity';
import { GoogleProfileDto } from './dto/google.profile.dto';
import { GrpcUnauthenticatedException } from 'nestjs-grpc-exceptions';

// const userInfo: GoogleProfileDto = {
//     provider: 'google',
//     providerId: '1234',
//     email: 'test@example.com',
//     name: 'onyou.code',
//     avatarUrl: 'https://example.com/avatar.png',
//     emailVerified: true,
// };

// const payload = {
//     sub: 1,
//     version: 1,
//     role: UserMicroService.UserRole.USER,
//     type: 'access',
//     name: userInfo.name,
//     email: userInfo.email,
//     avatarUrl: userInfo.avatarUrl,
// };

// const cachedUser: UserEntity = {
//     ...payload,
//     id: payload.sub,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     provider: userInfo.provider,
//     providerId: userInfo.providerId,
//     emailVerified: userInfo.emailVerified,
// };

describe('UserService', () => {
    let userService: UserService;
    let jwtService: jest.Mocked<JwtService>;
    let redisService: jest.Mocked<RedisService>;

    const mockUserRepository = {
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserEntity>>;

    const mockDataSource = {
        getRepository: jest.fn().mockImplementation(entity => {
            if (entity === UserEntity) {
                return mockUserRepository;
            }
        }),
    } as unknown as jest.Mocked<DataSource>;

    const mockJwtService = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const mockConfigService = {
        getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    const mockRedisService = {
        set: jest.fn(),
        get: jest.fn(),
        ttl: jest.fn(),
        del: jest.fn(),
    } as unknown as jest.Mocked<RedisService>;

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

        userService = module.get(UserService);
        jwtService = module.get(JwtService);
        redisService = module.get(RedisService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findOrCreateUserByGoogle', () => {
        const request: GoogleProfileDto = {
            provider: 'google',
            providerId: '1234',
            email: 'test@example.com',
            name: 'onyou.code',
            avatarUrl: 'https://example.com/avatar.png',
            emailVerified: false,
        };

        it('should create new user if not found', async () => {
            const createdUser = { ...request, role: UserMicroService.UserRole.USER, id: 1 };

            jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(mockUserRepository, 'create').mockReturnValue(createdUser as UserEntity);
            jest.spyOn(mockUserRepository, 'save').mockResolvedValue(createdUser as UserEntity);

            const result = await userService.findOrCreateUserByGoogle(request);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { provider: request.provider, providerId: request.providerId },
            });
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                ...request,
                role: UserMicroService.UserRole.USER,
            });
            expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
            expect(result).toEqual(createdUser);
        });

        it('should create new user if not null', async () => {
            const foundUser = { ...request, role: UserMicroService.UserRole.USER, id: 1 };

            jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(foundUser as UserEntity);

            const result = await userService.findOrCreateUserByGoogle(request);
            expect(result).toEqual(foundUser);
        });
    });

    describe('getUserInfoByUserId', () => {
        const request: UserMicroService.GetUserInfoByUserIdRequest = { id: 1 };

        it('should return a user info by userId', async () => {
            const foundUser = { id: request.id, name: 'onyou.code' } as UserEntity;

            jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(foundUser);

            const result = await userService.getUserInfoByUserId(request.id);
            expect(result).toEqual(foundUser);
            expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: request.id });
        });
    });

    describe('updateUserInfo', () => {
        const request: UserMicroService.UpdateUserInfoRequest = {
            id: 1,
            name: 'onyou.code',
        };

        it('should update user info', async () => {
            const foundUser = { id: request.id, name: 'onyou.code' } as UserEntity;

            jest.spyOn(mockUserRepository, 'update').mockResolvedValue(undefined);
            jest.spyOn(userService, 'getUserInfoByUserId').mockResolvedValue(foundUser);
            jest.spyOn(userService, 'setUserInfoToCache').mockResolvedValue(undefined);

            const result = await userService.updateUserInfo(request);

            expect(mockUserRepository.update).toHaveBeenCalledWith(request.id, { id: request.id, name: request.name });
            expect(userService.getUserInfoByUserId).toHaveBeenCalledWith(request.id);
            expect(userService.setUserInfoToCache).toHaveBeenCalledWith(result);
            expect(result).toEqual(foundUser);
        });

        it('should throw GrpcUnauthenticatedException if user not found', async () => {
            jest.spyOn(mockUserRepository, 'update').mockResolvedValue(undefined);
            jest.spyOn(userService, 'getUserInfoByUserId').mockResolvedValue(null);

            await expect(userService.updateUserInfo(request)).rejects.toThrow(GrpcUnauthenticatedException);
            expect(mockUserRepository.update).toHaveBeenCalledWith(request.id, { id: request.id, name: request.name });
            expect(userService.getUserInfoByUserId).toHaveBeenCalledWith(request.id);
        });
    });

    describe('signInWithGoogle', () => {
        const request: GoogleProfileDto = {
            provider: 'google',
            providerId: '1234',
            email: 'test@example.com',
            name: 'onyou.code',
            avatarUrl: 'https://example.com/avatar.png',
            emailVerified: false,
        };

        it('should return accessToken and refreshToken', async () => {
            const user = { id: 1, ...request } as UserEntity;
            const tokens = { accessToken: 'accessToken', refreshToken: 'refreshToken' };

            jest.spyOn(userService, 'findOrCreateUserByGoogle').mockResolvedValue(user);
            jest.spyOn(userService, 'issueTokenByUserId').mockResolvedValue(tokens);

            const result = await userService.signInWithGoogle(user);
            expect(result).toEqual(tokens);
            expect(userService.issueTokenByUserId).toHaveBeenCalledWith(user.id);
        });

        it('should throw GrpcUnauthenticatedException if issueTokenByUserId throws', async () => {
            const user = { id: 1, ...request } as UserEntity;

            jest.spyOn(userService, 'issueTokenByUserId').mockRejectedValue(Error);

            await expect(userService.signInWithGoogle(user)).rejects.toThrow(GrpcUnauthenticatedException);
            expect(userService.issueTokenByUserId).toHaveBeenCalledWith(user.id);
        });

        describe('issueTokenByUserId', () => {
            const request = { userId: 1 };
            const user = { id: request.userId, name: 'onyou.code' } as UserEntity;
            const tokens = { accessToken: 'accessToken', refreshToken: 'refreshToken' };

            it('should return accessToken and refreshToken', async () => {
                jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user as UserEntity);
                jest.spyOn(userService, 'deleteUserInfoFromCache').mockResolvedValue(undefined);
                jest.spyOn(userService, 'issueToken')
                    .mockResolvedValueOnce(tokens.accessToken)
                    .mockResolvedValueOnce(tokens.refreshToken);

                const result = await userService.issueTokenByUserId(user.id);

                expect(result).toEqual(tokens);
                expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
                expect(userService.deleteUserInfoFromCache).toHaveBeenCalledWith(user.id);
                expect(userService.issueToken).toHaveBeenNthCalledWith(1, user, false);
                expect(userService.issueToken).toHaveBeenNthCalledWith(2, user, true);
            });

            it('should throw GrpcUnauthenticatedException if user not found', async () => {
                jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
                jest.spyOn(userService, 'deleteUserInfoFromCache').mockResolvedValue(undefined);

                await expect(userService.issueTokenByUserId(user.id)).rejects.toThrow(GrpcUnauthenticatedException);
                expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
            });
        });
    });

    describe('issueToken', () => {
        const request = { userId: 1 };
        const user = {
            id: request.userId,
            name: 'onyou.code',
            version: 1,
            role: UserMicroService.UserRole.USER,
        } as UserEntity;

        it('should return accessToken', async () => {
            const token = 'accessToken';
            const isRefresh = false;
            const payload = {
                sub: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                type: 'access',
                version: user.version,
            };

            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

            const result = await userService.issueToken(user, isRefresh);

            expect(result).toEqual(token);
            expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
                secret: userService['accessSecret'],
                expiresIn: userService['accessExpireIn'],
            });
        });

        it('should return refreshToken', async () => {
            const token = 'refreshToken';
            const isRefresh = true;
            const payload = {
                sub: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                type: 'refresh',
                version: user.version,
            };

            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

            // expect
            const result = await userService.issueToken(user as UserEntity, isRefresh);
            expect(result).toEqual(token);
            expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
                secret: userService['refreshSecret'],
                expiresIn: userService['refreshExpireIn'],
            });
        });
    });

    describe('setUserInfoToCache', () => {
        it('should set user to cache with computed ttl when payloadExp is provided', async () => {
            const user = { id: 1, name: 'onyou.code' } as UserEntity;
            const now = Math.floor(Date.now() / 1000);
            const payloadExp = now + 60 * 10;
            const expectedTtl = payloadExp - now - 5 * 60;

            // mock
            jest.spyOn(global.Date, 'now').mockReturnValue(now * 1000);
            const redisSetSpy = jest.spyOn(redisService, 'set').mockResolvedValue(undefined);

            // expect
            await userService.setUserInfoToCache(user, payloadExp);
            expect(redisSetSpy).toHaveBeenCalledWith(`user:payload:${user.id}`, user, expectedTtl);
        });
    });

    describe('getUserInfoFromCache', () => {
        it('should return user info from cache', async () => {
            const user = { id: 1, name: 'onyou.code' } as UserEntity;

            // mock
            jest.spyOn(redisService, 'get').mockResolvedValue(user);

            // expect
            const result = await userService.getUserInfoFromCache(user.id);
            expect(result).toEqual(user);
            expect(redisService.get).toHaveBeenCalledWith(`user:payload:${user.id}`);
        });
    });

    describe('deleteUserInfoFromCache', () => {
        it('should delete user info from cache', async () => {
            const userId = 1;

            // mock
            jest.spyOn(redisService, 'del').mockResolvedValue(undefined);

            // expect
            await userService.deleteUserInfoFromCache(userId);
            expect(redisService.del).toHaveBeenCalledWith(`user:payload:${userId}`);
        });
    });
});
