import {
  Controller, Get, Post, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser, CurrentUserData, Public } from '@app/auth-common';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @ApiOperation({ summary: 'Criar pedido diretamente (sem carrinho)' })
  @ApiResponse({ status: 201, description: 'Pedido criado, pagamento iniciado' })
  @ApiResponse({ status: 400, description: 'Estoque insuficiente ou produto inativo' })
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: CurrentUserData) {
    return this.pedidosService.create(user.userId, dto);
  }

  @ApiOperation({ summary: 'Listar meus pedidos' })
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.pedidosService.findAllByUser(user.userId);
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'pedidos' };
  }

  @ApiOperation({ summary: 'Detalhe de um pedido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado ou não pertence ao usuário' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.pedidosService.findOne(id, user.userId);
  }

  @ApiOperation({ summary: 'Cancelar pedido (apenas PENDING)' })
  @ApiResponse({ status: 400, description: 'Pedido não pode ser cancelado no status atual' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.pedidosService.cancel(id, user.userId);
  }
}
