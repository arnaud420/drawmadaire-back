import { Badge } from 'src/badges/badge.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserToGame } from '../users-games/users-games.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pseudo: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  @Index({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isUnauth: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  activationCode: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserToGame, (userToGame) => userToGame.user)
  userToGames: UserToGame[];

  @OneToMany(() => Badge, badge => badge.receiver)
  badges: Badge[];
}
