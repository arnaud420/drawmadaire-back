import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
// import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/user.entity';
import {
  CreateUnauthUserDto,
  CreateUserDto,
  LoginUserDto, UpdateAvatarDto, UpdateUserDto,
} from 'src/users/user.validation';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { PasswordResetDto } from './auth.validation';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async registerUser(body: CreateUserDto): Promise<any> {
    let user = null;
    try {
      const dbUser = await this.usersService.findOne({
        where: { pseudo: body.pseudo, isUnauth: false },
      });

      if (dbUser) {
        throw new HttpException('Pseudo already taken', HttpStatus.FORBIDDEN);
      }

      const hash = await bcrypt.hash(body.password, 10);

      if (body.id) {
        user = await this.usersService.update(body.id, {
          ...body,
          isUnauth: false,
          password: hash,
          isActive: false,
          activationCode: uuidv4(),
        })
      } else {
        user = await this.usersService.create({
          ...body,
          password: hash,
          isActive: false,
          activationCode: uuidv4(),
        });
      }
      const token = this.signToken(user);

      const mailInfo = await this.mailerService.sendMail({
        to: user.email,
        from: 'arnaud.lafon@ynov.com',
        subject: 'Inscription à Drawmadaire !',
        template: 'welcome',
        context: {
          pseudo: user.pseudo,
          registerLink: `${this.configService.get<string>('apiUrl')}/auth/validate/${user.activationCode}`,
          appLink: this.configService.get<string>('frontUrl'),
        }
      });

      // const mailPreviewUrl = nodemailer.getTestMessageUrl(mailInfo);

      return {
        user,
        token,
        // mailPreviewUrl,
      };
    } catch (error) {
      if (user) {
        await this.usersService.remove(user.id);
      }
      throw error;
    }
  }

  async updateUser(body: UpdateUserDto): Promise<any> {
    let user = await this.usersService.findById(body.id, true)
    if (body.password.length && body.newPassword.length) {
      const match = await bcrypt.compare(body.password, user.password)
      delete user.password;
      if (!match) {
        throw new HttpException('Actual password doesn\'t match', HttpStatus.UNAUTHORIZED);
      }
    }

    const hash = body.newPassword.length ? await bcrypt.hash(body.newPassword, 10) : user.password

    const userUpdated = {
      ...user,
      ...body,
      password: hash
    }

    user = await this.usersService.update(body.id, userUpdated)

    return {
      user,
    };
  }

  async updateUserAvatar(body: UpdateAvatarDto): Promise<User> {
    const user = await this.usersService.findById(body.id)
    if (!user) throw new Error(`Utilisateur (${body.id}) introuvable.`)

    user.avatar = body.avatar;
    return await this.usersRepository.save(user);
  }

  async validateUser(code: string): Promise<User> {
    const user = await this.usersService.findOne({ where: { activationCode: code } });
    const updatedUser = await this.usersService.update(user, {
      activationCode: null,
      isActive: true,
    });
    return updatedUser;
  }

  async registerUnauthUser(body: CreateUnauthUserDto): Promise<any> {
    const user = await this.usersService.create({
      ...body,
      isActive: true,
      isUnauth: true,
    });
    const token = this.signToken(user);
    return {
      user,
      token,
    };
  }

  async login(body: LoginUserDto): Promise<any> {
    let user = await this.usersService.findOne({
      where: { email: body.login },
    });

    if (!user) {
      user = await this.usersService.findOne({
        where: { pseudo: body.login },
      });
    }

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user = await this.usersService.findById(user.id, true);

    const match = await bcrypt.compare(body.password, user.password);

    delete user.password;

    if (!match) {
      throw new HttpException("Password don't match", HttpStatus.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new HttpException('User is inactive', HttpStatus.UNAUTHORIZED);
    }

    const token = this.signToken(user);

    return {
      user,
      token,
    };
  }

  async refreshToken(token: string) {
    const decoded = await this.jwtService.verifyAsync(token);
    let user = await this.usersService.findOne({
      where: { id: decoded.sub },
    });

    if (user.refreshToken === token) {
      throw new HttpException('Token already used', HttpStatus.UNAUTHORIZED);
    }

    user = await this.usersService.update(decoded.sub, {
      refreshToken: token,
    });

    return this.signToken(user);
  }

  signToken(user: User) {
    const expiresIn = 3600;
    return {
      token_type: 'Bearer',
      expiresIn,
      accessToken: this.jwtService.sign({ sub: user.id }, { expiresIn }),
      refreshToken: this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '60 days' },
      ),
    };
  }

  async forgotPassword(login: string) {
    let user = await this.usersService.findOne({
      where: { email: login, isActive: true, isUnauth: false },
    });

    if (!user) {
      user = await this.usersService.findOne({
        where: { pseudo: login, isActive: true, isUnauth: false },
      });
    }

    if (!user) {
      return null;
    }

    crypto.randomBytes(30, async (err, buffer) => {
      if (err) {
        throw err;
      }
      const token = buffer.toString('hex');
      user = await this.usersService.update(user, {
        resetPasswordToken: token,
      });

      await this.mailerService.sendMail({
        to: user.email,
        from: 'arnaud.lafon@ynov.com',
        subject: 'Réinitialisation de mot de passe - Drawmadaire !',
        template: 'reset',
        context: {
          pseudo: user.pseudo,
          resetLink: `${this.configService.get<string>('frontUrl')}/reset-password/${token}`,
          appLink: this.configService.get<string>('frontUrl'),
        }
      });
    });

    return null;
  }

  async resetPassword(body: PasswordResetDto) {
    if (body.password.toString() !== body.confirmPassword.toString()) {
      throw new HttpException('Password and confirm password missmatch', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let user = await this.usersService.findOne({
      where: { resetPasswordToken: body.token, isActive: true, isUnauth: false },
    });

    if (!user) {
      throw new HttpException('An error occured during reset password process. Token expired. Please retry', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    user = await this.usersService.update(user, {
      resetPasswordToken: null,
      password: await bcrypt.hash(body.password, 10),
    });

    return user;
  }

}
