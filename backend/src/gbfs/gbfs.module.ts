import { Module } from '@nestjs/common';
import { GbfsService } from './gbfs.service.ts';

@Module({
  providers: [GbfsService],
  exports: [GbfsService],
})
export class GbfsModule {}
