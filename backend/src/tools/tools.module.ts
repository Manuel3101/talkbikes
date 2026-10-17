import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service.ts';

@Module({
  providers: [ToolsService],
})
export class ToolsModule {}
