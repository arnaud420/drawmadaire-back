import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { GameHistory } from '../gamesHistories/gameHistory.entity';
import { UserToGame } from '../users-games/users-games.entity';
import { ItemService } from './item.service';
import { GameHistoryModule } from '../gamesHistories/gameHistory.module';
import { UsersGamesModule } from '../users-games/users-games.module';
import { GamesModule } from '../games/games.module';
import { Game } from '../games/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, GameHistory, UserToGame, Game])],
  providers: [ItemService, GameHistoryModule, UsersGamesModule, GamesModule],
  controllers: [],
  exports: [ItemService],
})
export class ItemModule { }
