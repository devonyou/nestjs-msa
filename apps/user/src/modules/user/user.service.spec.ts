import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService, UserMicroService } from '@app/common';
import { UserEntity } from '../../entities/user.entity';

const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
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

const mockDataSource = {
    getRepository: jest
        .fn(entity => {
            if (entity === UserEntity) return mockUserRepository;
        })
        .mockReturnValue(mockUserRepository),
};

describe('UserService', () => {
    let userService: UserService;

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

    it('should create new user if not found', async () => {
        const userInfo = {
            provider: 'google',
            providerId: '1234',
            email: 'test@example.com',
            name: 'onyou.code',
            avatarUrl: 'https://example.com/avatar.png',
            emailVerified: true,
        };

        // findOne returns null → 사용자 없음
        mockUserRepository.findOne.mockResolvedValue(null);

        // create mock
        const createdUser = { ...userInfo, role: UserMicroService.UserRole.USER };
        mockUserRepository.create.mockReturnValue(createdUser);
        mockUserRepository.save.mockResolvedValue({ id: 'user-id', ...createdUser });

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
});
