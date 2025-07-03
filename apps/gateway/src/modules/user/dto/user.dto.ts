import { UserMicroService } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto implements UserMicroService.User {
    @ApiProperty({ description: '유저 id', example: 1 })
    id: number;

    @ApiProperty({ description: '유저 공급자', example: 'google' })
    provider: string;

    @ApiProperty({ description: '유저 공급자 id', example: '1234567890' })
    providerId: string;

    @ApiProperty({ description: '유저 권한', example: UserMicroService.UserRole.USER })
    role: UserMicroService.UserRole;

    @ApiProperty({ description: '유저 이름', example: 'John Doe' })
    name: string;

    @ApiProperty({ description: '유저 이메일', example: 'john.doe@example.com' })
    email: string;

    @ApiProperty({ description: '유저 아바타 url', example: 'https://example.com/avatar.png' })
    avatarUrl: string;

    @ApiProperty({ description: '유저 이메일 인증 여부', example: true })
    emailVerified: boolean;

    @ApiProperty({ description: '유저 버전', example: 1 })
    version: number;
}
