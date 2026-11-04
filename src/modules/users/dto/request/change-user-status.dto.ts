import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { USER_STATUS } from '../../../../constants/general';

export class ChangeUserStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: [USER_STATUS.ACTIVE, USER_STATUS.BLOCKED] })
  @IsEnum([USER_STATUS.ACTIVE, USER_STATUS.BLOCKED])
  @IsNotEmpty()
  status: string;
}
