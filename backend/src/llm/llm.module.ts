import { Module } from '@nestjs/common';

import { ToolsService } from '../tools/tools.service.ts';
import { LlmService } from './llm.service.js';

@Module({
  providers: [LlmService, ToolsService],
  exports: [LlmService],
})
export class LlmModule {}
