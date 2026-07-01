import {
  Controller, Get, Post, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser, CurrentUserData, Public } from '@app/auth-common';

@Controller('orders')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: CurrentUserData) {
    return this.pedidosService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.pedidosService.findAllByUser(user.userId);
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'pedidos' };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.pedidosService.findOne(id, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.pedidosService.cancel(id, user.userId);
  }
}
