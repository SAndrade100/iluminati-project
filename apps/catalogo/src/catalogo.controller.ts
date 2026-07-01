import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Public, CurrentUser, CurrentUserData, Roles } from '@app/auth-common';

@Controller()
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  // ─── Products ───────────────────────────────────────────────────

  @Roles('SELLER', 'ADMIN')
  @Post('products')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: CurrentUserData) {
    return this.catalogoService.create(dto, user.userId, user.role);
  }

  @Public()
  @Get('products')
  findAll(@Query() filter: FilterProductDto) {
    return this.catalogoService.findAll(filter);
  }

  @Public()
  @Get('health')
  health() { return { status: 'ok', service: 'catalogo' }; }

  @Public()
  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.catalogoService.findOne(id);
  }

  @Roles('SELLER', 'ADMIN')
  @Patch('products/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: CurrentUserData) {
    return this.catalogoService.update(id, dto, user.userId, user.role);
  }

  @Roles('SELLER', 'ADMIN')
  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.catalogoService.remove(id, user.userId, user.role);
  }

  // ─── Categories ──────────────────────────────────────────────────

  @Public()
  @Get('categories')
  findCategories() {
    return this.catalogoService.findAllCategories();
  }

  @Roles('ADMIN')
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogoService.createCategory(dto);
  }

  @Roles('ADMIN')
  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCategory(@Param('id') id: string) {
    return this.catalogoService.removeCategory(id);
  }
}
