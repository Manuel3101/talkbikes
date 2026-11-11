import { Body, Controller, Get, HttpCode, Post, Res, StandardSchemaValidationPipe } from '@nestjs/common';
import { DEFAULT_LLM_PROVIDER, type LlmProviderInfo, type UserQuestion, userQuestionSchema } from '@talkbikes/shared';
import type { Response } from 'express';
import { LlmService } from './llm/llm.service.ts';
import { SseService } from './sse/sse.service.ts';

@Controller()
export class AppController {
  constructor(
    private readonly llmService: LlmService,
    private readonly sseService: SseService,
  ) {}

  @Get('providers')
  listProviders(): readonly LlmProviderInfo[] {
    return this.llmService.listProviders();
  }

  @Post('chat')
  @HttpCode(200)
  async chat(
    @Body({ schema: userQuestionSchema, pipes: [StandardSchemaValidationPipe] }) body: UserQuestion,
    @Res() response: Response,
  ): Promise<void> {
    const id = crypto.randomUUID();

    const messages = this.llmService.orchestrateLlmRequest(body.question, {
      id,
      provider: body.provider ?? DEFAULT_LLM_PROVIDER,
    });

    await this.sseService.stream(response, id, messages);
  }
}
