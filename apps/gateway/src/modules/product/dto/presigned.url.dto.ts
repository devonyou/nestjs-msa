import { ProductMicroService } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GeneratePresignedUrlRequestDto implements ProductMicroService.GeneratePresignedUrlRequest {
    @ApiProperty({ description: 'content type' })
    @IsString()
    contentType: string;
}

export class GeneratePresignedUrlResponseDto implements ProductMicroService.GeneratePresignedUrlResponse {
    @ApiProperty({ description: 'presigned url' })
    presignedUrl: string;

    @ApiProperty({ description: 'filename' })
    filename: string;

    @ApiProperty({ description: 'file url' })
    fileUrl: string;
}
