import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserToGame } from './users-games.entity';

@Injectable()
export class UsersGamesService {
  constructor(
    @InjectRepository(UserToGame)
    private usersGamesRepository: Repository<UserToGame>,
  ) {}

  findAll(): Promise<UserToGame[]> {
    return this.usersGamesRepository.find();
  }

  async create(data: any): Promise<UserToGame> {
    return await this.usersGamesRepository.save(data);
  }

  async findOne(options: any): Promise<UserToGame> {
    return await this.usersGamesRepository.findOne(options);
  }
}
