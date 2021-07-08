import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { UserToGame } from '../users-games/users-games.entity';
import { Badge } from '../badges/badge.entity';
import { GameHistory } from 'src/gamesHistories/gameHistory.entity';

export enum ItemType {
  SENTENCE = 'SENTENCE',
  DRAW = 'DRAW',
}

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  content: string;

  @ManyToOne(() => UserToGame)
  @JoinColumn()
  userGame: UserToGame;

  @OneToMany(() => Badge, (badge) => badge.item)
  badges: Badge[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: ItemType,
    default: ItemType.SENTENCE,
    nullable: true,
  })
  type: ItemType;

  @ManyToOne(() => GameHistory)
  gameHistory: GameHistory;
}
