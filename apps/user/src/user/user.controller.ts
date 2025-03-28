import { Controller, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcInterceptor, UserMicroService } from '@app/common';

@Controller('user')
@UserMicroService.UserServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class UserController implements UserMicroService.UserServiceController {
    constructor(private readonly userService: UserService) {}

    getUserInfo(
        req: UserMicroService.GetUserInfoRequest,
    ): Promise<UserMicroService.GetUserInfoResponse> {
        const { userId } = req;
        return this.userService.getUserById(userId);
    }
}
