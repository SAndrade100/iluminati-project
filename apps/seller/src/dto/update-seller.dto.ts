import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSellerDto {
  @ApiPropertyOptional({ example: 'Novo Nome da Loja', maxLength: 80 })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  storeName?: string;

  @ApiPropertyOptional({ example: 'Descrição atualizada', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
