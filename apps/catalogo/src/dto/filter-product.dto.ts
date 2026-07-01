import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PageQueryDto } from '@app/database';
import { ProductStatus } from '@app/database';

export class FilterProductDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  sellerId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
