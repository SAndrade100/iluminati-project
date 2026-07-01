import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from '@app/database';

@Controller('products')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.catalogoService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: ProductStatus) {
    return this.catalogoService.findAll(status);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'catalogo' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogoService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.catalogoService.remove(id);
  }
}
