import { Body, Controller, Header, HttpCode, Post, Res, StandardSchemaValidationPipe } from '@nestjs/common';
import { type UserQuestion, userQuestionSchema } from '@talkbikes/shared';
import type { Response } from 'express';
import { LlmService } from './llm/llm.service.ts';

@Controller()
export class AppController {
  constructor(private readonly llmService: LlmService) {}

  @Post('chat')
  @Header('Content-Type', 'application/x-ndjson; charset=utf-8')
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  @HttpCode(200)
  async chat(
    @Body({ schema: userQuestionSchema, pipes: [StandardSchemaValidationPipe] }) body: UserQuestion,
    @Res() response: Response,
  ): Promise<void> {
    response.flushHeaders();

    try {
      for await (const message of this.llmService.streamChat(body.question)) {
        if (response.destroyed) {
          return;
        }

        response.write(`${JSON.stringify(message)}\n`);
      }
    } catch (error: unknown) {
      console.error('Error while generating a response:', error);
    } finally {
      response.end();
    }
  }
}
