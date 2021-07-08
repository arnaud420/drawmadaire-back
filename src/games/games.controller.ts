import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GamesService } from './games.service';
import { createApiResponse } from '../helpers/apiResponseHandler';
import { NewGameDto } from './games.validation';

@ApiTags('games')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gameService: GamesService) { }

  @Get()
  @ApiBearerAuth()
  async findAll() {
    try {
      const users = await this.gameService.findAll();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error };
    }
  }

  @Get(':id/results')
  async validate(@Param() params) {
    const gameResults = await this.gameService.getResults(params.id);
    return { success: true, data: gameResults }
  }

  @Post('new')
  async createGame(@Body() data: NewGameDto) {
    const { userId, isPrivate } = data;

    // TODO: For public games,
    return isPrivate ? await createApiResponse(async () => {
      return await this.gameService.create(userId);
    })
      : await createApiResponse(async () => {
        return await this.gameService.create(userId);
      })
  }
}
