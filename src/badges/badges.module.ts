import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from './badge.entity';
import { BadgesService } from './badges.service';

@Module({
  imports: [TypeOrmModule.forFeature([Badge])],
  providers: [BadgesService],
  controllers: [],
  exports: [BadgesService],
})
export class BadgesModule { }
