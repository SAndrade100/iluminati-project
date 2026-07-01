import { IsString, IsOptional, IsNumber, IsPositive, Min, MinLength, MaxLength, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@app/database';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
