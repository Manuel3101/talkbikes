import { Module } from '@nestjs/common';
import { GbfsModule } from '../gbfs/gbfs.module.ts';
import { ToolsService } from './tools.service.ts';

@Module({
  providers: [ToolsService],
  exports: [ToolsService],
  imports: [GbfsModule],
})
export class ToolsModule {}
