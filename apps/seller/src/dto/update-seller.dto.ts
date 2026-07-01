import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateSellerDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  storeName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
