import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CheckoutDto } from '../dto/checkout.dto';
import { CurrentUser, CurrentUserData } from '@app/auth-common';

@ApiTags('cart')
@ApiBearerAuth('access-token')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Ver carrinho atual' })
  @Get()
  getCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.getCart(user.userId);
  }

  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  @ApiResponse({ status: 400, description: 'Estoque insuficiente' })
  @Post('items')
  addItem(@Body() dto: AddCartItemDto, @CurrentUser() user: CurrentUserData) {
    return this.cartService.addItem(user.userId, dto);
  }

  @ApiOperation({ summary: 'Atualizar quantidade de item' })
  @Patch('items/:productId')
  updateItem(
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.cartService.updateItem(user.userId, productId, dto.quantity);
  }

  @ApiOperation({ summary: 'Remover item do carrinho' })
  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  removeItem(@Param('productId') productId: string, @CurrentUser() user: CurrentUserData) {
    return this.cartService.removeItem(user.userId, productId);
  }

  @ApiOperation({ summary: 'Esvaziar carrinho' })
  @Delete()
  @HttpCode(HttpStatus.OK)
  clearCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.clearCart(user.userId);
  }

  @ApiOperation({ summary: 'Finalizar compra (converte carrinho em pedido)' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Carrinho vazio ou estoque insuficiente' })
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: CurrentUserData) {
    return this.cartService.checkout(user.userId, dto.paymentMethod);
  }
}
