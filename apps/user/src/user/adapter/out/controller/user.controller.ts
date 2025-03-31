import { UserMicroService } from '@app/common';
import { Controller } from '@nestjs/common';
import { FindUserUsecase } from '../../../usecase/find.user.usecase';

@Controller()
@UserMicroService.UserServiceControllerMethods()
export class UserController implements UserMicroService.UserServiceController {
    constructor(private readonly findUserUsecase: FindUserUsecase) {}

    async getUserInfo(
        request: UserMicroService.GetUserInfoRequest,
    ): Promise<UserMicroService.GetUserInfoResponse> {
        const user = await this.findUserUsecase.findUserById(request.userId);
        return user;
    }
}
