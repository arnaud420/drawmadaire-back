import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GamePhase, HelpType, MIN_DRAW_TIME, SettingsProperties } from './game.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { UsersGamesService } from '../users-games/users-games.service';
import { Item, ItemType } from '../items/item.entity';
import { UserToGame } from '../users-games/users-games.entity';
import { ItemService } from '../items/item.service';

export interface PlayerItem {
  item: Item,
  player: UserToGame,
  phase: GamePhase,
  help?: string,
}

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private userGamesService: UsersGamesService,
  ) {}

  findAll(): Promise<Game[]> {
    return this.gamesRepository.find();
  }

  findOne(id: string): Promise<Game> {
    return this.gamesRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.gamesRepository.delete(id);
  }

  findByRoomId(roomId: string): Promise<Game> {
    return this.gamesRepository.findOne(
    { roomId },
    {
      relations: ['userToGames', 'userToGames.user', 'gameHistories'],
      loadRelationIds: {
        relations: ['owner'],
      }
    });
  }

  async create(userId: number): Promise<Game> {
    const user: User = await this.usersRepository.findOne(userId)

    if (!user) {
      throw new Error(`User ${userId} not found.`);
    }

    const game = this.gamesRepository.create();
    game.owner = user;
    game.roomId = Math.random().toString(36).substr(2);

    return await this.gamesRepository.save(game);
  }

  async addUserToGame(userId: number, gameRoomId: string, socketClientId: string): Promise<Game> {
    const game = await this.findByRoomId(gameRoomId);
    if (!game) throw new Error(`Game with room id ${gameRoomId} not found`);

    if (game.gameHistories.length > 0) {
      throw new Error('You cannot join a started game');
    }

    // Player already in the game
    if (game.userToGames.map(player => player.userId).includes(userId)) {
      return game;
    }

    const user = await this.usersService.findOne(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    await this.userGamesService.create({
      userId: user.id,
      gameId: game.id,
      position: game.userToGames.length + 1,
      socketClientId,
      user,
      game,
    })

    return await this.findByRoomId(gameRoomId);
  }

  async setSettings(settings: Record<string, any>, roomId: string): Promise<Game> {
    const game = await this.findByRoomId(roomId);
    if (!game) throw new Error(`Game with room id ${roomId} not found`);

    Object.keys(settings).map((property: string) => {
      if (SettingsProperties.includes(property)) {
        game[property] = settings[property];
      }
    })

    if (game.drawTime < MIN_DRAW_TIME) {
      throw new Error(`Le temps minimum est de ${MIN_DRAW_TIME} secondes.`);
    }

    return await this.gamesRepository.save(game);
  }

  async startGame(roomId) {
    const game = await this.findByRoomId(roomId);
    if (!game) throw new Error(`Game with room id ${roomId} not found`);

    if (game.userToGames.length < 4) {
      throw new Error('Game require 4 players minimum.');
    }

    game.phase = GamePhase.SENTENCE;
    await this.gamesRepository.save(game);
  }

  async isEndOfPhase(gameId: number): Promise<boolean> {
    const game = await this.gamesRepository.findOne(gameId, {
      relations: ['gameHistories', 'gameHistories.items', 'userToGames']
    });

    if (game.gameHistories.length !== game.userToGames.length) {
      return false;
    }

    return game.gameHistories.reduce((acc: boolean, current, index) => {
      if (acc === false) return false;
      if (index === 0) return true;
      return game.gameHistories[index - 1].items.length === current.items.length
    }, true)
  }

  async isEndOfGame(gameId: number): Promise<boolean>  {
    const game = await this.gamesRepository.findOne(gameId, {
      relations: ['gameHistories', 'gameHistories.items', 'userToGames']
    });

    const playersAreEven = game.userToGames.length % 2 === 0;

    return game.gameHistories.reduce((acc: boolean, current) => {
      if (acc === false) return false;
      return current.items.length === (game.userToGames.length + (playersAreEven ? 1 : 0));
    }, true)
  }

  static getHelp(helpType: HelpType, item: Item) {
    if (helpType === HelpType.LENGTH && item.type === ItemType.DRAW) {
      const firstItem = ItemService.getFirstCreatedItem(item.gameHistory.items);

      if (firstItem) {
        // Replace all characters by underscore (except whitespace)
        return firstItem.content.replace(/\S/g, '_');
      }
    }

    return null;
  }

  async getItemsForNewPhase(gameId: number): Promise<PlayerItem[]> {
    const game = await this.gamesRepository.findOne(gameId, {
      relations: ['userToGames', 'userToGames.items', 'userToGames.items.gameHistory', 'userToGames.items.gameHistory.items']
    });

    return game.userToGames.map((player, index): PlayerItem => {
      let previousIndex = index === 0 ? game.userToGames.length - 1 : index - 1;

      // 1° tour && nombre de joueurs pairs : chaque joueur dessine sa première phrase
      if (game.userToGames[0].items.length === 1 && game.userToGames.length % 2 === 0) {
        previousIndex = index;
      }

      const item = ItemService.getLastCreatedItem(game.userToGames[previousIndex].items);
      const help = GamesService.getHelp(game.help, item);

      return {
        player,
        item,
        phase: item.type === ItemType.SENTENCE ? GamePhase.DRAW : GamePhase.GUESS,
        help,
      }
    })
  }

  async getResults(gameId: number) {
    const game = await this.gamesRepository.findOne(gameId, {
      relations: ['gameHistories', 'gameHistories.items', 'gameHistories.items.badges', 'gameHistories.items.userGame', 'gameHistories.items.userGame.user']
    });

    game.gameHistories = game.gameHistories.map((history) => {
      history.items = history.items.sort((a, b) => (
        (a.createdAt > b.createdAt) ? 1 : ((b.createdAt > a.createdAt) ? -1 : 0))
      )
      return history;
    })

    return game;
  }

  async findRoomIdByClientId(clientId: string) {
    const userGame = await this.userGamesService.findOne({ where: { socketClientId: clientId } })
    if (userGame) {
      const { gameId } = userGame
      const game = await this.gamesRepository.findOne(gameId)
      if (game) {
        return game.roomId
      }
    }

    return null
  }
}
