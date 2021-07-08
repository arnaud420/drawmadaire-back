import { IsNotEmpty } from 'class-validator';

export class NewGameDto {
  @IsNotEmpty()
  userId: number;
  isPrivate: boolean;
}
