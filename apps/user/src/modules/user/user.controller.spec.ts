import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TestBed } from '@automock/jest';
import { UserEntity } from '../../entities/user.entity';
import { UserMicroService } from '@app/common';

describe('UserController', () => {
    let userController: UserController;
    let userService: jest.Mocked<UserService>;

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(UserController).compile();

        userController = unit;
        userService = unitRef.get(UserService);
    });

    // verifyToken
    describe('verifyToken', () => {
        const request: UserMicroService.VerifyTokenRequest = { token: 'token', isRefresh: false };

        it('should return user info', async () => {
            const user = new UserEntity();

            jest.spyOn(userService, 'verifyToken').mockResolvedValue({ user: user, verify: true });

            const result = await userController.verifyToken(request);
            expect(result).toEqual({ user, verify: true });
        });
    });

    // getUserInfoByUserId
    describe('getUserInfoByUserId', () => {
        const request: UserMicroService.GetUserInfoByUserIdRequest = { id: 1 };

        it('should return user info', async () => {
            const user = new UserEntity();

            jest.spyOn(userService, 'getUserInfoByUserId').mockResolvedValue(user);

            const result = await userController.getUserInfoByUserId(request);

            expect(result).toEqual(user);
        });
    });

    // refreshToken
    describe('refreshToken', () => {
        const request: UserMicroService.RefreshTokenRequest = { userId: 1 };

        it('should return user info', async () => {
            const tokens = { accessToken: 'accessToken', refreshToken: 'refreshToken' };

            jest.spyOn(userService, 'issueTokenByUserId').mockResolvedValue(tokens);

            const result = await userController.refreshToken(request);

            expect(result).toEqual(tokens);
        });
    });

    // updateUserInfo
    describe('updateUserInfo', () => {
        const request: UserMicroService.UpdateUserInfoRequest = { id: 1, name: 'test' };

        it('should return user info', async () => {
            const user = new UserEntity();

            jest.spyOn(userService, 'updateUserInfo').mockResolvedValue(user);

            const result = await userController.updateUserInfo(request);

            expect(result).toEqual(user);
        });
    });
});
