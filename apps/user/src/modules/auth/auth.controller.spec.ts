import { TestingModule, Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';

const mockUserService = {
    signInWithGoogle: jest.fn(),
};

describe('AuthController', () => {
    let authController: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
    });

    // signInWithGoogle
    describe('signInWithGoogle', () => {
        it('should be defined', () => {
            expect(authController.signInWithGoogle).toBeDefined();
            authController.signInWithGoogle();
        });
    });

    // signInWithGoogleCallback
    describe('signInWithGoogleCallback', () => {
        it('should return user info', async () => {
            const request = { user: { id: 1, name: 'test' } };
            const tokens = {
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
            };

            // mock
            jest.spyOn(mockUserService, 'signInWithGoogle').mockResolvedValue(tokens);

            // expect
            const result = await authController.signInWithGoogleCallback(request as any);
            expect(result).toEqual(tokens);
        });
    });
});
