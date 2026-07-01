import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplySellerDto {
  @ApiProperty({ example: 'Minha Loja Top', minLength: 3, maxLength: 80 })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  storeName: string;

  @ApiPropertyOptional({ example: 'Vendo produtos eletrônicos de qualidade', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
