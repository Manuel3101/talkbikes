import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module.ts';
import { GbfsService } from './gbfs.service.ts';

@Module({
  imports: [RedisModule],
  providers: [GbfsService],
  exports: [GbfsService],
})
export class GbfsModule {}
