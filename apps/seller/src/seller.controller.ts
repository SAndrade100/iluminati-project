import {
  Controller, Get, Post, Patch, Put, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PageQueryDto } from '@app/database';
import { Public, CurrentUser, CurrentUserData, Roles } from '@app/auth-common';

@Controller('sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Public()
  @Get('health')
  health() { return { status: 'ok', service: 'seller' }; }

  // Qualquer usuário autenticado pode solicitar ser seller
  @Post('apply')
  apply(@Body() dto: ApplySellerDto, @CurrentUser() user: CurrentUserData) {
    return this.sellerService.apply(user.userId, dto);
  }

  // Seller vê e edita seu próprio perfil
  @Roles('SELLER', 'ADMIN')
  @Get('me')
  findMine(@CurrentUser() user: CurrentUserData) {
    return this.sellerService.findMine(user.userId);
  }

  @Roles('SELLER', 'ADMIN')
  @Patch('me')
  updateMine(@Body() dto: UpdateSellerDto, @CurrentUser() user: CurrentUserData) {
    return this.sellerService.updateMine(user.userId, dto);
  }

  // Admin vê todos (incluindo pendentes)
  @Roles('ADMIN')
  @Get('admin')
  findAllAdmin(@Query() query: PageQueryDto) {
    return this.sellerService.findAllAdmin(query);
  }

  @Roles('ADMIN')
  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string) {
    return this.sellerService.approve(id);
  }

  @Roles('ADMIN')
  @Put(':id/suspend')
  @HttpCode(HttpStatus.OK)
  suspend(@Param('id') id: string) {
    return this.sellerService.suspend(id);
  }

  // Lista pública de sellers ativos
  @Public()
  @Get()
  findAll(@Query() query: PageQueryDto) {
    return this.sellerService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellerService.findOne(id);
  }
}
