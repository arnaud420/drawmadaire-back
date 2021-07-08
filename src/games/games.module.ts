import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';
import { UserToGame } from '../users-games/users-games.entity';
import { UsersService } from '../users/users.service';
import { UsersGamesService } from '../users-games/users-games.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, UserToGame])],
  providers: [GamesService, UsersModule, UsersService, UsersGamesService],
  controllers: [GamesController],
  exports: [GamesService],
})
export class GamesModule { }
