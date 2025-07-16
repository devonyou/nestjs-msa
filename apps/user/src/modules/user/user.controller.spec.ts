import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
    verifyToken: jest.fn(),
    getUserInfoByUserId: jest.fn(),
    issueTokenByUserId: jest.fn(),
    updateUserInfo: jest.fn(),
};

describe('UserController', () => {
    let userController: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
    });

    // verifyToken
    describe('verifyToken', () => {
        it('should return user info', async () => {
            const request = { token: 'token', isRefresh: false };
            const result = await userController.verifyToken(request);
            expect(result).toEqual(mockUserService.verifyToken(request));
        });
    });

    // getUserInfoByUserId
    describe('getUserInfoByUserId', () => {
        it('should return user info', async () => {
            const request = { id: 1 };
            const result = await userController.getUserInfoByUserId(request);
            expect(result).toEqual(mockUserService.getUserInfoByUserId(request));
        });
    });

    // refreshToken
    describe('refreshToken', () => {
        it('should return user info', async () => {
            const request = { userId: 1 };
            const result = await userController.refreshToken(request);
            expect(result).toEqual(mockUserService.issueTokenByUserId(request));
        });
    });

    // updateUserInfo
    describe('updateUserInfo', () => {
        it('should return user info', async () => {
            const request = { id: 1, name: 'test' };
            const result = await userController.updateUserInfo(request);
            expect(result).toEqual(mockUserService.updateUserInfo(request));
        });
    });
});
