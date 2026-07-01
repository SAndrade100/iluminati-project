import {
  Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { PageQueryDto } from '@app/database';
import { Public, Roles } from '@app/auth-common';

@ApiTags('coupons')
@ApiBearerAuth('access-token')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiOperation({ summary: '[ADMIN] Criar cupom de desconto' })
  @ApiResponse({ status: 409, description: 'Código já existe' })
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @ApiOperation({ summary: '[ADMIN] Listar todos os cupons (paginado)' })
  @Roles('ADMIN')
  @Get()
  findAll(@Query() query: PageQueryDto) {
    return this.couponService.findAll(query);
  }

  @ApiOperation({ summary: 'Validar cupom e calcular desconto (público)' })
  @ApiResponse({ status: 400, description: 'Cupom inativo, expirado ou limite atingido' })
  @Public()
  @Get(':code/validate')
  validate(@Param('code') code: string, @Query('subtotal') subtotal = '0') {
    return this.couponService.validate(code, Number(subtotal));
  }

  @ApiOperation({ summary: '[ADMIN] Ativar cupom' })
  @Roles('ADMIN')
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string) {
    return this.couponService.toggle(id, true);
  }

  @ApiOperation({ summary: '[ADMIN] Desativar cupom' })
  @Roles('ADMIN')
  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string) {
    return this.couponService.toggle(id, false);
  }
}
