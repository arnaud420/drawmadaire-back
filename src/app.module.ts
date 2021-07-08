import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { UsersGamesModule } from './users-games/users-games.module';
import { AuthModule } from './auth/auth.module';
import { GameGateway } from './gateway/game/game.gateway';
import config from '../config';
import typeormConfig from '../config/typeorm';
import nodemailerConfig from '../config/nodemailer';
import { GameHistoryModule } from './gamesHistories/gameHistory.module';
import { ItemModule } from './items/item.module';
import { BadgesService } from './badges/badges.service';
import { BadgesModule } from './badges/badges.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => nodemailerConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => typeormConfig(configService),
      inject: [ConfigService],
    }),
    UsersModule,
    GamesModule,
    UsersGamesModule,
    AuthModule,
    ConfigModule,
    GameHistoryModule,
    ItemModule,
    BadgesModule,
  ],
  controllers: [AppController],
  providers: [AppService, GameGateway],
})

export class AppModule { }
