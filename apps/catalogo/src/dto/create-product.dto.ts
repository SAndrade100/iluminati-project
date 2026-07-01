import { IsString, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min, MinLength, MaxLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Tênis Air Max', minLength: 2, maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Calçado esportivo premium', maxLength: 1000 })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 299.90, description: 'Preço em BRL (máx. 2 casas decimais)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @ApiProperty({ example: 'AIRMAX-001', maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  sku: string;

  @ApiPropertyOptional({ description: 'ID da categoria' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID do seller (só ADMIN pode definir manualmente)' })
  @IsString()
  @IsOptional()
  sellerId?: string;
}
