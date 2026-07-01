import {
  Controller, Get, Post, Patch, Put, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PageQueryDto } from '@app/database';
import { Public, CurrentUser, CurrentUserData, Roles } from '@app/auth-common';

@ApiTags('sellers')
@ApiBearerAuth('access-token')
@Controller('sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Public()
  @ApiOperation({ summary: 'Health check' })
  @Get('health')
  health() { return { status: 'ok', service: 'seller' }; }

  @ApiOperation({ summary: 'Solicitar conta de vendedor' })
  @ApiResponse({ status: 201, description: 'Solicitação criada (status: PENDING)' })
  @ApiResponse({ status: 409, description: 'Já possui perfil de vendedor' })
  @Post('apply')
  apply(@Body() dto: ApplySellerDto, @CurrentUser() user: CurrentUserData) {
    return this.sellerService.apply(user.userId, dto);
  }

  @ApiOperation({ summary: 'Ver meu perfil de vendedor' })
  @Roles('SELLER', 'ADMIN')
  @Get('me')
  findMine(@CurrentUser() user: CurrentUserData) {
    return this.sellerService.findMine(user.userId);
  }

  @ApiOperation({ summary: 'Atualizar meu perfil de vendedor' })
  @Roles('SELLER', 'ADMIN')
  @Patch('me')
  updateMine(@Body() dto: UpdateSellerDto, @CurrentUser() user: CurrentUserData) {
    return this.sellerService.updateMine(user.userId, dto);
  }

  @ApiOperation({ summary: '[ADMIN] Lista todos os sellers (incluindo pendentes)' })
  @Roles('ADMIN')
  @Get('admin')
  findAllAdmin(@Query() query: PageQueryDto) {
    return this.sellerService.findAllAdmin(query);
  }

  @ApiOperation({ summary: '[ADMIN] Aprovar seller' })
  @ApiResponse({ status: 200, description: 'Seller aprovado, role promovida a SELLER' })
  @Roles('ADMIN')
  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string) {
    return this.sellerService.approve(id);
  }

  @ApiOperation({ summary: '[ADMIN] Suspender seller' })
  @Roles('ADMIN')
  @Put(':id/suspend')
  @HttpCode(HttpStatus.OK)
  suspend(@Param('id') id: string) {
    return this.sellerService.suspend(id);
  }

  @Public()
  @ApiOperation({ summary: 'Lista sellers ativos (público)' })
  @Get()
  findAll(@Query() query: PageQueryDto) {
    return this.sellerService.findAll(query);
  }

  @Public()
  @ApiOperation({ summary: 'Detalhe de um seller (público)' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellerService.findOne(id);
  }
}
