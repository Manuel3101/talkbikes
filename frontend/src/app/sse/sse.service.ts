import { Service } from '@angular/core';
import { type SseEvent, sseEventSchema, validateInput } from '@talkbikes/shared';
import { createParser, type EventSourceMessage } from 'eventsource-parser';

@Service()
export class Sse {
  /**
   * Parses a `text/event-stream` response body into typed events.
   */
  public async *parseToSseEvent(stream: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<SseEvent> {
    const decoder = new TextDecoder();
    let pending: EventSourceMessage[] = [];
    const parser = createParser({
      onEvent: message => {
        pending.push(message);
      },
    });

    try {
      while (true) {
        const { done, value } = await stream.read();
        if (done) {
          break;
        }

        parser.feed(decoder.decode(value, { stream: true }));
        const messages = pending;
        pending = [];
        for (const message of messages) {
          yield this.toEvent(message);
        }
      }
    } finally {
      stream.releaseLock();
    }
  }

  private toEvent(message: EventSourceMessage): SseEvent {
    const name = message.event ?? 'message';

    let payload: unknown;
    try {
      payload = JSON.parse(message.data);
    } catch {
      throw new Error(`Invalid "${name}" event: data is not valid JSON`);
    }

    return this.validate({ event: name, data: payload });
  }

  private validate(value: unknown): SseEvent {
    const { success, output, issues } = validateInput(sseEventSchema, value);
    if (!success) {
      const details = issues
        .slice(0, 5)
        .map(issue => `${issue.path?.map(segment => String(segment.key)).join('.') || '(root)'}: ${issue.message}`)
        .join('; ');
      console.error('Invalid server-sent event:', value);
      throw new Error(`Invalid server-sent event: ${details}`);
    }

    return output;
  }
}
