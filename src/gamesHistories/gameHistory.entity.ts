import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Game } from 'src/games/game.entity';
import { Item } from 'src/items/item.entity';

@Entity()
export class GameHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game, (game) => game.gameHistories)
  game: Game;

  @OneToMany(() => Item, (item) => item.gameHistory)
  @JoinColumn()
  items: Item[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
