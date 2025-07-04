import { Body, Get, Patch } from '@nestjs/common';
import { ApiController } from '../../common/decorator/api.controller.decorator';
import { GatewayUserService } from './gateway.user.service';
import { Auth } from '../../common/decorator/auth.decorator';
import { User } from '../../common/decorator/user.decorator';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { UpdateUserInfoRequestDto, UpdateUserInfoResponseDto } from './dto/user.update.dto';

@ApiController('user')
export class GatewayUserController {
    constructor(private readonly gatewayUserService: GatewayUserService) {}

    @Get()
    @Auth(false)
    @ApiOperation({ summary: '유저 정보 조회' })
    @ApiOkResponse({ description: '유저 정보 조회 성공', type: UserDto })
    getUserInfo(@User() user: UserPayload): Promise<UserDto> {
        return this.gatewayUserService.getUserInfoByUserId(user.sub);
    }

    @Patch()
    @Auth(false)
    @ApiOperation({ summary: '유저 정보 수정' })
    @ApiOkResponse({ description: '유저 정보 수정 성공', type: UpdateUserInfoResponseDto })
    updateUserInfo(
        @User() user: UserPayload,
        @Body() dto: UpdateUserInfoRequestDto,
    ): Promise<UpdateUserInfoResponseDto> {
        return this.gatewayUserService.updateUserInfo(user.sub, dto);
    }
}
