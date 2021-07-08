import { GameHistory } from 'src/gamesHistories/gameHistory.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { UserToGame } from '../users-games/users-games.entity';
import { User } from '../users/user.entity';

export enum GamePhase {
  WAITING = 'waiting',
  SENTENCE = 'sentence',
  DRAW = 'draw',
  GUESS = 'guess',
  RESULTS = 'results',
}

export enum GameType {
  WORD = 'WORD',
  SENTENCE = 'SENTENCE',
  BOTH = 'BOTH',
}

export enum HelpType {
  NONE = 'NONE',
  LENGTH = 'LENGTH',
}

export const SettingsProperties = [
  'maxUser', 'drawTime', 'type', 'maxLetter', 'help',
]

export const MIN_DRAW_TIME = 10;

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomId: string;

  @Column({
    type: 'enum',
    enum: GamePhase,
    default: GamePhase.WAITING,
  })
  phase: GamePhase;

  @Column({
    nullable: true,
    default: 12,
  })
  maxUser: number;

  @Column({
    nullable: true,
    default: 60,
  })
  drawTime: number;

  @Column({
    type: 'enum',
    enum: GameType,
    default: GameType.BOTH,
    nullable: true,
  })
  type: GameType;

  @Column({
    type: 'enum',
    enum: HelpType,
    default: HelpType.NONE,
    nullable: true,
  })
  help: HelpType;

  @ManyToOne(() => User)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserToGame, (userToGame) => userToGame.game)
  userToGames: UserToGame[];

  @OneToMany(() => GameHistory, (gameHistory) => gameHistory.game)
  gameHistories: GameHistory[];
}
