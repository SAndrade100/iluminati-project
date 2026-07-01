import { IsString, IsOptional, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Eletrônicos', minLength: 2, maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @ApiProperty({ example: 'eletronicos', description: 'URL slug único' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  slug: string;

  @ApiPropertyOptional({ description: 'ID da categoria pai (hierarquia)' })
  @IsString()
  @IsOptional()
  parentId?: string;
}
