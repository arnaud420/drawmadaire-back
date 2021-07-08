import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersGamesService } from './users-games.service';

@ApiTags('users-games')
@Controller('users-games')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersGamesController {
  constructor(private readonly usersGamesService: UsersGamesService) {}

  @Get()
  async findAll() {
    try {
      const usersGames = await this.usersGamesService.findAll();
      return { success: true, data: usersGames };
    } catch (error) {
      return { success: false, error };
    }
  }
}
