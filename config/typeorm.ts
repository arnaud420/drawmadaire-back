import { DefaultNamingStrategy, Table, NamingStrategyInterface } from 'typeorm';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GameHistory } from 'src/gamesHistories/gameHistory.entity';
import { Game } from 'src/games/game.entity';
import { User } from 'src/users/user.entity';
import { UserToGame } from 'src/users-games/users-games.entity';
import { Badge } from 'src/badges/badge.entity';
import { Item } from 'src/items/item.entity';

class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  foreignKeyName(tableOrName: Table | string, columnNames: string[], referencedTablePath?: string, referencedColumnNames?: string[]): string {
    tableOrName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;

    const name = columnNames.reduce(
      (name, column) => `${name}_${column}`,
      `${tableOrName}_${referencedTablePath}`,
    );

    return `fk_${crypto.createHash('md5').update(name).digest('hex')}`
  }
}

const config = (configService: ConfigService) => ({
  host: configService.get<string>('database.host'),
  type: configService.get<string>('database.type'),
  port: configService.get<number>('database.port'),
  username: configService.get<string>('database.username'),
  password: configService.get<string>('database.password'),
  database: configService.get<string>('database.database'),
  entities: [GameHistory, Game, User, UserToGame, Badge, Item],
  synchronize: true,
  mainStrategy: CustomNamingStrategy,
}) as TypeOrmModuleOptions;

export default config;
