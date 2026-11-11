import { Module } from '@nestjs/common';
import { AppController } from './app.controller.ts';
import { GbfsModule } from './gbfs/gbfs.module.ts';
import { LlmModule } from './llm/llm.module.ts';
import { SseService } from './sse/sse.service.ts';
import { ToolsModule } from './tools/tools.module.ts';

@Module({
  imports: [LlmModule, ToolsModule, GbfsModule],
  controllers: [AppController],
  providers: [SseService],
})
export class AppModule {}
