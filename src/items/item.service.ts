import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemType } from './item.entity';
import { GameHistory } from '../gamesHistories/gameHistory.entity';
import { UserToGame } from '../users-games/users-games.entity';
import { Game, GameType } from '../games/game.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(GameHistory)
    private gameHistoryRepository: Repository<GameHistory>,
    @InjectRepository(UserToGame)
    private userGameRepository: Repository<UserToGame>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>
  ) { }

  static getLastCreatedItem(items: Item[]): Item | null {
    return items.reduce((acc: Item | null, current) => {
      return (
        acc.createdAt.getTime() < current.createdAt.getTime() ? current : acc
      )
    }, items[0])
  }

  static getFirstCreatedItem(items: Item[]): Item | null {
    return items.reduce((acc: Item | null, current) => {
      return (
        acc.createdAt.getTime() > current.createdAt.getTime() ? current : acc
      )
    }, items[0])
  }

  static isJsonString(jsonString: string): boolean {
    try {
      const item = JSON.parse(jsonString);

      return typeof item === 'object' && item !== null;
    } catch (e) {
      return false;
    }
  }

  static hasAlreadySendItem(content: string, lastItem: Item) {
    // First Item
    if (!lastItem) {
      return true;
    }

    const isDraw = this.isJsonString(content);

    if ((isDraw && lastItem.type === ItemType.DRAW) || (!isDraw && lastItem.type === ItemType.SENTENCE)) {
      throw new Error('You already have send your response');
    }
  }

  async create(gameHistoryId: number, playerId: number, content: string): Promise<Item> {
    const gameHistory = await this.gameHistoryRepository.findOne(gameHistoryId, { relations: ['items'] });
    if (!gameHistory) throw new Error(`Game History with id ${gameHistory} not found`);

    const userGame = await this.userGameRepository.findOne(playerId);
    if (!userGame) throw new Error(`UserGame (player) with id ${playerId} not found`);

    const lastItem = ItemService.getLastCreatedItem(gameHistory.items);
    ItemService.hasAlreadySendItem(content, lastItem);

    const item = this.itemRepository.create({
      content,
      userGame,
      gameHistory,
      type: lastItem && lastItem.type === ItemType.SENTENCE ? ItemType.DRAW : ItemType.SENTENCE,
    });

    return await this.itemRepository.save(item);
  }

  async isSentenceValid(sentence: string, gameId: number): Promise<void> {
    const game = await this.gameRepository.findOne(gameId);
    const cleanSentence = sentence.trim();

    switch (game.type) {
      case GameType.SENTENCE:
        if (cleanSentence.length < 5 || cleanSentence.indexOf(' ') === -1) {
          throw new Error('Votre expression doit être une phrase.');
        }
        break;
      case GameType.WORD:
        if (cleanSentence.length < 2 || cleanSentence.indexOf(' ') !== -1) {
          throw new Error('Votre expression doit être un seul mot.');
        }
        break;
      default:
        if (cleanSentence.length <= 2) {
          throw new Error('Votre expression doit faire au moins 2 caractères.');
        }
    }
  }

  async findOne(options: any): Promise<Item> {
    return await this.itemRepository.findOne(options);
  }
}
