import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CheckoutDto } from '../dto/checkout.dto';
import { CurrentUser, CurrentUserData } from '@app/auth-common';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  addItem(@Body() dto: AddCartItemDto, @CurrentUser() user: CurrentUserData) {
    return this.cartService.addItem(user.userId, dto);
  }

  @Patch('items/:productId')
  updateItem(
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cartService.updateItem(user.userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  removeItem(@Param('productId') productId: string, @CurrentUser() user: CurrentUserData) {
    return this.cartService.removeItem(user.userId, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  clearCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.clearCart(user.userId);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: CurrentUserData) {
    return this.cartService.checkout(user.userId, dto.paymentMethod);
  }
}
