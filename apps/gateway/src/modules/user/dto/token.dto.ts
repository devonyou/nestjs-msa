import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
    @ApiProperty({ description: 'accessToken' })
    accessToken: string;

    @ApiProperty({ description: 'refreshToken' })
    refreshToken: string;
}
