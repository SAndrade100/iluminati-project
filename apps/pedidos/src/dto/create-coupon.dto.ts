import {
  IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional,
  IsPositive, IsBoolean, IsDateString, IsInt, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@app/database';

export class CreateCouponDto {
  @ApiProperty({ example: 'PROMO10', description: 'Código único (case-insensitive convertido para maiúsculo)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @ApiPropertyOptional({ example: '10% de desconto na primeira compra', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 10, description: 'Valor do desconto (% ou R$ fixo)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  discountValue: number;

  @ApiPropertyOptional({ example: 100, description: 'Valor mínimo do pedido para aplicar o cupom' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Type(() => Number)
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 100, description: 'Número máximo de usos (null = ilimitado)' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  maxUses?: number;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z', description: 'Data de expiração (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
