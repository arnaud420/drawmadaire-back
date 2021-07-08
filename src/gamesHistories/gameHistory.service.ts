import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameHistory } from './gameHistory.entity';
import { Game } from '../games/game.entity';

@Injectable()
export class GameHistoryService {
  constructor(
    @InjectRepository(GameHistory)
    private gameHistoryRepository: Repository<GameHistory>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async create(gameId: number): Promise<GameHistory> {
    const game = await this.gameRepository.findOne(gameId);
    if (!game) throw new Error(`Game with id ${gameId} not found`);

    const gameHistory = this.gameHistoryRepository.create({ game });
    return await this.gameHistoryRepository.save(gameHistory);
  }
}
