import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { LlmModule } from './llm/llm.module.js';
import { ToolsModule } from './tools/tools.module.js';
import { GbfsModule } from './gbfs/gbfs.module.js';

@Module({
  imports: [LlmModule, ToolsModule, GbfsModule],
  controllers: [AppController],
})
export class AppModule {}
