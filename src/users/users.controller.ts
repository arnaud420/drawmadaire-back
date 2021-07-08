import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { generateUserWithStats } from 'src/helpers/statsHelper';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAll() {
    try {
      const users = await this.userService.findAll();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error };
    }
  }

  @Get('me')
  async me(@Req() req) {
    try {
      const { userId } = req.user;
      const user = generateUserWithStats(
        await this.userService.findOne({ 
          where: { id: userId },
          relations: ['badges', 'userToGames']
        }
      ));
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error };
    }
  }
}
