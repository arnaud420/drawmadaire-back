import { Controller, Post, Body, HttpCode, Get, Param, Res, HttpStatus, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateUserDto,
  LoginUserDto,
  CreateUnauthUserDto, UpdateUserDto, UpdateAvatarDto,
} from 'src/users/user.validation';
import { AuthService } from './auth.service';
import { PasswordResetDto, TokenDto } from './auth.validation';
import { createApiResponse } from '../helpers/apiResponseHandler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.login(loginUserDto);
    return { data: user };
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.registerUser(createUserDto);
    return { data: user };
  }

  @Post('update')
  async update(@Body() updateUserDto: UpdateUserDto) {
    const user = await this.authService.updateUser(updateUserDto);
    return { data: user };
  }

  @Post('update-avatar')
  async updateAvatar(@Body() updatedAvatar: UpdateAvatarDto) {
    return await createApiResponse(async () => {
      const user = await this.authService.updateUserAvatar(updatedAvatar);
    })
  }

  @Get('validate/:code')
  async validate(@Param() params, @Res() res) {
    const user = await this.authService.validateUser(params.code);
    return res.redirect(`${this.configService.get<string>('frontUrl')}?userValidated`);
  }

  @Post('register/unauth')
  async registerUnauth(@Body() createUnauthUserDto: CreateUnauthUserDto) {
    const user = await this.authService.registerUnauthUser(createUnauthUserDto);
    return { data: user };
  }

  @Post('token')
  @HttpCode(200)
  async token(@Body() tokenDto: TokenDto) {
    const newToken = await this.authService.refreshToken(tokenDto.token);
    return { success: true, data: newToken };
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() body) {
    if (!body.login) {
      throw new HttpException('email or pseudo required', HttpStatus.NO_CONTENT);
    }
    await this.authService.forgotPassword(body.login);
    return { message: 'Email send with success' };
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: PasswordResetDto) {
    const user = await this.authService.resetPassword(body);
    return { message: 'Password reset with success' };
  }
}
