import {
  IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressLabel } from '@app/database';

export class CreateAddressDto {
  @ApiProperty({ enum: AddressLabel, default: AddressLabel.HOME })
  @IsEnum(AddressLabel)
  @IsOptional()
  label?: AddressLabel;

  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  street: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  number: string;

  @ApiPropertyOptional({ example: 'Apto 45' })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  complement?: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  city: string;

  @ApiProperty({ example: 'SP', description: 'Sigla do estado (2 letras)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  state: string;

  @ApiProperty({ example: '01310-100', description: 'CEP (somente dígitos ou com hífen)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(9)
  zipCode: string;

  @ApiPropertyOptional({ default: false, description: 'Definir como endereço padrão' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
