import { ParseBearerTokenUsecase } from './../../../usecase/parse.bearer.token.usecase';
import { LoginUserUsecase } from './../../../usecase/login.user.usecase';
import { CreateUserUsecase } from './../../../usecase/create.user.usecase';
import { GrpcInterceptor, UserMicroService } from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';

@Controller('auth')
@UserMicroService.AuthServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class AuthController implements UserMicroService.AuthServiceController {
    constructor(
        private readonly createUserUsecase: CreateUserUsecase,
        private readonly loginUserUsecase: LoginUserUsecase,
        private readonly parseBearerTokenUsecase: ParseBearerTokenUsecase,
    ) {}

    async registerUser(
        request: UserMicroService.RegisterUserRequest,
    ): Promise<UserMicroService.RegisterUserResponse> {
        const user = await this.createUserUsecase.execute(request);
        return user;
    }

    async loginUser(
        request: UserMicroService.LoginUserRequest,
    ): Promise<UserMicroService.LoginUserResponse> {
        const result = await this.loginUserUsecase.execute(request.token);
        return result;
    }

    async parseBearerToken(
        request: UserMicroService.ParseBearerTokenRequest,
    ): Promise<UserMicroService.ParseBearerTokenResponse> {
        const result = await this.parseBearerTokenUsecase.execute(
            request.token,
        );
        return result;
    }
}
