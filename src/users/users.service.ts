import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(options: any): Promise<User> {
    return await this.usersRepository.findOne(options);
  }

  async findById(id: number | string, showPassword = false): Promise<User> {
    return await this.usersRepository
      .createQueryBuilder('row')
      .addSelect(showPassword ? 'row.password' : '')
      .where('row.id = :id', { id: id.toString() })
      .getOne();
  }

  async create(data: any): Promise<User> {
    return await this.usersRepository.save(data);
  }

  async update(idOrUser: string | number | User, body: any): Promise<User> {
    let userToUpdate = null;
    if (idOrUser instanceof User) {
      userToUpdate = idOrUser;
    } else {
      userToUpdate = await this.findOne({ where: { id: idOrUser.toString() } });
    }

    return await this.usersRepository.save({
      ...userToUpdate,
      ...body,
    });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
