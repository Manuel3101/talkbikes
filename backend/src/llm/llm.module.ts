import { Module } from '@nestjs/common';

import { GbfsModule } from '../gbfs/gbfs.module.ts';
import { ToolsModule } from '../tools/tools.module.ts';
import { CloudflareAdapter } from './adapter/cloudflare.ts';
import { OllamaAdapter } from './adapter/ollama.ts';
import { LlmService } from './llm.service.ts';
import { LlmFactory } from './llmFactory.ts';

@Module({
  providers: [LlmService, OllamaAdapter, CloudflareAdapter, LlmFactory],
  exports: [LlmService],
  imports: [GbfsModule, ToolsModule],
})
export class LlmModule {}
