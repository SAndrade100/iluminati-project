import { IsString, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min, MinLength, MaxLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  sku: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  // Apenas ADMIN pode definir manualmente; para SELLER é ignorado (sobrescrito pelo sellerId do perfil)
  @IsString()
  @IsOptional()
  sellerId?: string;
}
