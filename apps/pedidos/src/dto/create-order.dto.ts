import {
  IsArray, IsEnum, IsNotEmpty, IsString,
  ArrayMinSize, ValidateNested, IsInt, IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@app/database';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
