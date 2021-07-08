import { Item } from 'src/items/item.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

export enum BadgeName {
  LAUGH = 'LAUGH',
  LOVE = 'LOVE',
  SICK = 'SICK',
}

@Entity()
export class Badge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BadgeName,
  })
  name: BadgeName;

  @ManyToOne(() => Item, { nullable: true })
  item: Item;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  receiver: User;
}
