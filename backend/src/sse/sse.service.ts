import { Injectable } from '@nestjs/common';
import type { ChatMessage, SseEvent } from '@talkbikes/shared';
import type { Response } from 'express';

@Injectable()
export class SseService {
  /**
   * Streams the llm messages as server-sent events.
   *
   * Emits `start` immediately, then `content` / `tool` for each message and
   * finally `end`. Failures after the stream has been opened are reported as
   * an `error` event, as the HTTP status can no longer be changed.
   */
  async stream(response: Response, id: string, messages: AsyncIterable<ChatMessage>): Promise<void> {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    response.flushHeaders();

    try {
      this.writeEvent(response, { event: 'start', data: { id } });

      for await (const message of messages) {
        if (response.destroyed) {
          return;
        }

        for (const event of this.toEvents(message)) {
          this.writeEvent(response, event);
        }
      }

      this.writeEvent(response, { event: 'end', data: { id } });
    } catch (error: unknown) {
      console.error('Error while generating a response:', error);
      this.writeEvent(response, {
        event: 'error',
        data: { message: error instanceof Error ? error.message : 'Unknown error while generating a response' },
      });
    } finally {
      response.end();
    }
  }

  /**
   * Maps an llm message to the events the client is interested in.
   */
  toEvents(message: ChatMessage): SseEvent[] {
    if (message.role === 'assistant' && message.content) {
      return [{ event: 'content', data: { content: message.content } }];
    }

    if (message.role === 'tool' && message.tool_data) {
      if (!message.tool_data.success) {
        console.warn(`Tool ${message.tool_name ?? 'unknown'} failed:`, message.tool_data.error);
        return [];
      }
      return [{ event: 'tool', data: message.tool_data.locations }];
    }

    return [];
  }

  private writeEvent(response: Response, event: SseEvent): void {
    if (!response.destroyed) {
      response.write(`event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`);
    }
  }
}
