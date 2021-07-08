import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../games/game.entity';
import { GameHistory } from './gameHistory.entity';
import { GamesModule } from '../games/games.module';
import { GameHistoryService } from './gameHistory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, GameHistory])],
  providers: [GamesModule, GameHistoryService],
  controllers: [],
  exports: [GameHistoryService],
})
export class GameHistoryModule { }
