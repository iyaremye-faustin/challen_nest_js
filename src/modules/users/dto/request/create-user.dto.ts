import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sector: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cell: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  village: string;
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  role_id: string;
}
