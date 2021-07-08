import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersGamesService } from './users-games.service';
import { UsersGamesController } from './users-games.controller';
import { UserToGame } from './users-games.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserToGame])],
  providers: [UsersGamesService],
  controllers: [UsersGamesController],
  exports: [UsersGamesService],
})
export class UsersGamesModule {}
