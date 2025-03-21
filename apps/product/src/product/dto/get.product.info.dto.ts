import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class GetProductInfoDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    productIds: string[];
}
