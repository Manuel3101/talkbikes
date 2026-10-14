import { userQuestionSchema, validateInput } from '@chatwithgbfs/shared';
import { BadRequestException, Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('chat')
  async chat(@Body() body: unknown, @Res() response: Response): Promise<void> {
    const { success, output } = validateInput(userQuestionSchema, body);
    if (!success) {
      throw new BadRequestException('The request must include a non-empty question.');
    }

    response.status(200);
    response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('X-Accel-Buffering', 'no');

    for await (const message of this.appService.streamChat(output.question)) {
      if (response.destroyed) {
        return;
      }

      response.write(`${JSON.stringify(message)}\n`);
    }

    response.end();
  }
}
