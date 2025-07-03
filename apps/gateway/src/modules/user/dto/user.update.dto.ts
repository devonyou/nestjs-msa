import { UserMicroService } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserDto } from './user.dto';

export class UpdateUserInfoRequestDto {
    @ApiProperty({ description: '유저 이름' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: '유저 아바타 URL' })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiProperty({ description: '유저 역할' })
    @IsOptional()
    @IsEnum(UserMicroService.UserRole)
    role?: number;
}

export class UpdateUserInfoResponseDto extends UserDto {}
