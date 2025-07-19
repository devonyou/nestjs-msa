import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { TestBed } from '@automock/jest';

describe('AuthController', () => {
    let authController: AuthController;
    let userService: jest.Mocked<UserService>;

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(AuthController).compile();

        authController = unit;
        userService = unitRef.get(UserService);
    });

    describe('signInWithGoogle', () => {
        it('should be defined', () => {
            expect(authController.signInWithGoogle).toBeDefined();
            authController.signInWithGoogle();
        });
    });

    describe('signInWithGoogleCallback', () => {
        const request = { user: { id: 1, name: 'test' } };

        it('should return user info', async () => {
            const tokens = {
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
            };

            // mock
            jest.spyOn(userService, 'signInWithGoogle').mockResolvedValue(tokens);

            // expect
            const result = await authController.signInWithGoogleCallback(request as any);
            expect(result).toEqual(tokens);
        });
    });
});
