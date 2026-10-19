import { Module } from '@nestjs/common';

import { GbfsModule } from '../gbfs/gbfs.module.ts';
import { ToolsModule } from '../tools/tools.module.ts';
import { LlmService } from './llm.service.js';

@Module({
  providers: [LlmService],
  exports: [LlmService],
  imports: [GbfsModule, ToolsModule],
})
export class LlmModule {}
