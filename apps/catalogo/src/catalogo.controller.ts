import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogoService } from './catalogo.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Public, CurrentUser, CurrentUserData, Roles } from '@app/auth-common';

@ApiBearerAuth('access-token')
@Controller()
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @ApiTags('products')
  @ApiOperation({ summary: 'Criar produto (SELLER/ADMIN)' })
  @ApiResponse({ status: 201, description: 'Produto criado' })
  @ApiResponse({ status: 409, description: 'SKU ja existe' })
  @Roles('SELLER', 'ADMIN')
  @Post('products')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: CurrentUserData) {
    return this.catalogoService.create(dto, user.userId, user.role);
  }

  @ApiTags('products')
  @ApiOperation({ summary: 'Listar produtos (publico, paginado)' })
  @Public()
  @Get('products')
  findAll(@Query() filter: FilterProductDto) {
    return this.catalogoService.findAll(filter);
  }

  @Public()
  @Get('health')
  health() { return { status: 'ok', service: 'catalogo' }; }

  @ApiTags('products')
  @ApiOperation({ summary: 'Detalhe de produto (publico)' })
  @ApiResponse({ status: 404, description: 'Produto nao encontrado' })
  @Public()
  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.catalogoService.findOne(id);
  }

  @ApiTags('products')
  @ApiOperation({ summary: 'Atualizar produto (SELLER dono / ADMIN)' })
  @ApiResponse({ status: 403, description: 'Produto pertence a outro seller' })
  @Roles('SELLER', 'ADMIN')
  @Patch('products/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: CurrentUserData) {
    return this.catalogoService.update(id, dto, user.userId, user.role);
  }

  @ApiTags('products')
  @ApiOperation({ summary: 'Inativar produto (soft-delete)' })
  @Roles('SELLER', 'ADMIN')
  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.catalogoService.remove(id, user.userId, user.role);
  }

  @ApiTags('categories')
  @ApiOperation({ summary: 'Listar categorias raiz com subcategorias (publico)' })
  @Public()
  @Get('categories')
  findCategories() {
    return this.catalogoService.findAllCategories();
  }

  @ApiTags('categories')
  @ApiOperation({ summary: 'Criar categoria (ADMIN)' })
  @ApiResponse({ status: 409, description: 'Slug ja existe' })
  @Roles('ADMIN')
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogoService.createCategory(dto);
  }

  @ApiTags('categories')
  @ApiOperation({ summary: 'Remover categoria (ADMIN)' })
  @Roles('ADMIN')
  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCategory(@Param('id') id: string) {
    return this.catalogoService.removeCategory(id);
  }
}
