import {
  Controller, Get, Post, Patch, Delete, Put,
  Body, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { CurrentUser, CurrentUserData } from '@app/auth-common';

@ApiTags('addresses')
@ApiBearerAuth('access-token')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({ summary: 'Listar meus endereços' })
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.addressService.findAll(user.userId);
  }

  @ApiOperation({ summary: 'Criar endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado' })
  @Post()
  create(@Body() dto: CreateAddressDto, @CurrentUser() user: CurrentUserData) {
    return this.addressService.create(user.userId, dto);
  }

  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiResponse({ status: 403, description: 'Endereço não pertence ao usuário' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.addressService.update(id, user.userId, dto);
  }

  @ApiOperation({ summary: 'Definir endereço como padrão' })
  @Put(':id/default')
  @HttpCode(HttpStatus.OK)
  setDefault(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.addressService.setDefault(id, user.userId);
  }

  @ApiOperation({ summary: 'Remover endereço' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.addressService.remove(id, user.userId);
  }
}
