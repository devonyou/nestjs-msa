import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMicroService } from '@app/common';

@Controller()
@UserMicroService.UserServiceControllerMethods()
export class UserController implements UserMicroService.UserServiceController {
    constructor(private readonly userService: UserService) {}

    verifyToken(request: UserMicroService.VerifyTokenRequest): Promise<UserMicroService.VerifyTokenResponse> {
        return this.userService.verifyToken(request.token, request.isRefresh);
    }

    getUserInfoByUserId(request: UserMicroService.GetUserInfoByUserIdRequest): Promise<UserMicroService.User> {
        return this.userService.getUserInfoByUserId(request.id);
    }

    refreshToken(request: UserMicroService.RefreshTokenRequest): Promise<UserMicroService.RefreshTokenResponse> {
        return this.userService.issueTokenByUserId(request.userId);
    }

    updateUserInfo(request: UserMicroService.UpdateUserInfoRequest): Promise<UserMicroService.User> {
        return this.userService.updateUserInfo(request);
    }
}
