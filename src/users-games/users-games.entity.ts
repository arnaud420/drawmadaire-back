import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Game } from '../games/game.entity';
import { Item } from '../items/item.entity';

@Entity()
export class UserToGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  gameId: number;

  @Column()
  socketClientId: string;

  @Column()
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.userToGames)
  user: User;

  @ManyToOne(() => Game, (game) => game.userToGames)
  public game: Game;

  @OneToMany(() => Item, (item) => item.userGame)
  items: Item[];
}
