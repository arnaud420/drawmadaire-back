import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PasswordDto } from 'src/users/user.validation';

export class TokenDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}

export class PasswordResetDto extends PasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  token: string;
}
