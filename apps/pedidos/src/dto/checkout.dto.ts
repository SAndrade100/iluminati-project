import { IsEnum } from 'class-validator';
import { PaymentMethod } from '@app/database';

export class CheckoutDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
