import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AllPrivileges } from '../../../constants/privileges';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsEnum(AllPrivileges, { each: true })
  privileges?: string[];
}
