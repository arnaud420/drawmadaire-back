import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class PasswordDto {
  @ApiProperty({
    minimum: 6,
    maxLength: 20,
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}

export class CreateUserDto extends PasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  pseudo: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  id: string;
}

export class UpdateUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  pseudo: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  newPassword: string;
}

export class UpdateAvatarDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  avatar: string;
}

export class CreateUnauthUserDto {
  @ApiProperty()
  @IsNotEmpty()
  pseudo: string;

  @ApiProperty()
  avatar: string;
}

export class LoginUserDto extends PasswordDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email | pseudo',
  })
  login: string;
}
