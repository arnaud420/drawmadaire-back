import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { GamesService } from '../../games/games.service';
import { Game, GamePhase } from '../../games/game.entity';
import { GameHistoryService } from '../../gamesHistories/gameHistory.service';
import { ItemService } from '../../items/item.service';
import { BadgesService } from 'src/badges/badges.service';
import { BadgeName } from 'src/badges/badge.entity';

@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private usersService: UsersService,
    private gameService: GamesService,
    private gameHistoryService: GameHistoryService,
    private itemService: ItemService,
    private badgeService: BadgesService,
  ) { }

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('GameGateway');

  private interval: NodeJS.Timeout;

  private async socketResponse(logic: () => void, clientId) {
    try {
      await logic()
    } catch (e) {
      this.server.to(clientId).emit('customError', e.message);
      this.logger.error(e);
    }
  }

  @SubscribeMessage('join')
  async joinRoom(client: Socket, data: { roomId: string, userId: number }) {
    await this.socketResponse(async () => {
      const game: Game = await this.gameService.addUserToGame(data.userId, data.roomId, client.id)

      client.join(data.roomId);
      this.logger.log(`User (${data.userId}) ${client.id} join room ${data.roomId}`);

      this.server.to(data.roomId).emit('userJoined', game.userToGames);
      this.server.to(client.id).emit('initGameData', game);
    }, client.id)
  }

  @SubscribeMessage('updateSettings')
  async changeGameType(client: Socket, data: { roomId: string, settings: Record<string, any> }) {
    await this.socketResponse(async () => {
      const game = await this.gameService.setSettings(data.settings, data.roomId)
      this.server.to(data.roomId).emit('updateSettings', game);
    }, client.id);
  }

  @SubscribeMessage('startGame')
  async startGame(client: Socket, data: { roomId }) {
    await this.socketResponse(async () => {
      await this.gameService.startGame(data.roomId);
      this.server.to(data.roomId).emit('newPhase', GamePhase.SENTENCE);
    }, client.id);
  }

  @SubscribeMessage('firstSentence')
  async userSentence(client: Socket, data: { gameId, content, playerId }) {
    await this.socketResponse(async () => {
      const gameHistory = await this.gameHistoryService.create(data.gameId);
      await this.itemService.isSentenceValid(data.content, data.gameId);
      await this.handleNewItem({ ...data, gameHistoryId: gameHistory.id });
    }, client.id)
  }

  @SubscribeMessage('sendItem')
  async sendItem(client: Socket, data: { gameId, content, playerId, gameHistoryId }) {
    await this.socketResponse(async () => {
      await this.handleNewItem(data);
    }, client.id)
  }

  @SubscribeMessage('sendBadge')
  async sendBadge(client: Socket, data: { gameId, itemId, name }) {
    await this.socketResponse(async () => {
      await this.handleSendBadge(data);
    }, client.id)
  }

  async handleSendBadge({ itemId, gameId, name }) {
    console.log('handle send badge', { itemId, gameId, name });
    const item = await this.itemService.findOne(itemId);
    const badge = await this.badgeService.create({
      item,
      name,
    });
    const gameResults = await this.gameService.getResults(gameId);
    console.log('gameResults', gameResults);
    this.server.to(gameResults.roomId).emit('results', {
      results: gameResults.gameHistories,
      phase: GamePhase.RESULTS,
    });
  }


  async handleNewItem(data: { gameId, content, playerId, gameHistoryId }) {
    const game = await this.gameService.findOne(data.gameId);
    await this.itemService.create(data.gameHistoryId, data.playerId, data.content);
    this.server.to(game.roomId).emit('playerIsWaiting', data.playerId);

    const isEndOfPhase = await this.gameService.isEndOfPhase(data.gameId);
    if (isEndOfPhase) {
      const isEndOfGame = await this.gameService.isEndOfGame(data.gameId);

      if (isEndOfGame) {
        const gameResults = await this.gameService.getResults(data.gameId);
        this.server.to(gameResults.roomId).emit('results', {
          results: gameResults.gameHistories,
          phase: GamePhase.RESULTS,
        });
      } else {
        await this.launchNewPhase(data.gameId);
        this.handleTimer(game.roomId, game.drawTime);
      }
    }
  }

  async launchNewPhase(gameId: number) {
    const items = await this.gameService.getItemsForNewPhase(gameId);
    items.forEach((playerItem) => {
      this.server.to(playerItem.player.socketClientId).emit('newItem', playerItem);
    })
  }

  handleTimer(roomId: string, time: number) {
    clearInterval(this.interval);
    let remainingTime = time;

    this.interval = setInterval(() => {
      remainingTime = remainingTime - 1;
      this.server.to(roomId).emit('time', remainingTime);

      if (remainingTime === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  afterInit(): any {
    this.logger.log('Init');
  }

  handleConnection(client: Socket): any {
    this.logger.log(`Client connected !!! : ${client.id}`);
  }

  handleDisconnect(client: Socket): any {
    this.gameService.findRoomIdByClientId(client.id)
      .then((roomId) => {
        if (roomId) {
          this.server.to(roomId).emit('customError', 'Un des joueurs présent dans la partie s\'est déconnecté (shame on him), vous devez recommencer une nouvelle partie pour jouer à nouveau. 😢')
        }
      })
    this.logger.log(`Client disconnected : ${client.id}`);
  }
}

