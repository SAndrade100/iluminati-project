import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Nota de 1 a 5 estrelas' })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({ example: 'Produto excelente, chegou rápido!', maxLength: 800 })
  @IsString()
  @IsOptional()
  @MaxLength(800)
  comment?: string;

  @ApiPropertyOptional({ description: 'ID do pedido que originou a compra (opcional, para verificação)' })
  @IsString()
  @IsOptional()
  orderId?: string;
}
