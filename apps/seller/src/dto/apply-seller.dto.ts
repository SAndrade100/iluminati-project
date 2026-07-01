import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class ApplySellerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  storeName: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
