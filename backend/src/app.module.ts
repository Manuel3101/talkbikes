import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { LlmModule } from './llm/llm.module.ts';
import { ToolsModule } from './tools/tools.module.ts';

@Module({
  imports: [LlmModule, ToolsModule],
  controllers: [AppController],
})
export class AppModule {}
