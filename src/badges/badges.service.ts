import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private badgesRepository: Repository<Badge>,
  ) { }

  async findAll(): Promise<Badge[]> {
    return await this.badgesRepository.find();
  }

  async findOne(options: any): Promise<Badge> {
    return await this.badgesRepository.findOne(options);
  }

  async create(data: any): Promise<Badge> {
    return await this.badgesRepository.save(data);
  }

  async remove(id: string): Promise<void> {
    await this.badgesRepository.delete(id);
  }
}
