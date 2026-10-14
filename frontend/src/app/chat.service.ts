import { Injectable } from '@angular/core';
import { ChatMessage, chatMessageSchema, validateInput } from '@chatwithgbfs/shared';

// TODO: replace with .env variable
const CHAT_ENDPOINT = 'http://localhost:3000/chat';

@Injectable({ providedIn: 'root' })
export class ChatService {
  // TODO: add options object for things like "stream=true"
  async *send(question: string): AsyncGenerator<ChatMessage> {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Chat response has no body');
    }

    const reader = response.body.getReader();

    yield* this.parseNDJSON(reader);
  }

  private parseMessage(value: unknown): ChatMessage {
    const { success, output } = validateInput(chatMessageSchema, value);
    if (!success) {
      throw new Error(`Invalid chat message: ${output}`);
    }

    return output;
  }

  private async *parseNDJSON(stream: ReadableStreamDefaultReader<Uint8Array>) {
    let buffer = '';
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await stream.read();
        buffer += decoder.decode(value, { stream: !done });

        // get complete lines from the buffer
        const lines = buffer.split('\n');
        // keep the last line in the buffer in case it's incomplete
        buffer = lines.pop() ?? '';

        // parse each complete line as a JSON object and yield it
        for (const line of lines) {
          if (line.trim()) {
            yield this.parseMessage(JSON.parse(line));
          }
        }

        if (done) {
          break;
        }
      }
      // parse any remaining data in the buffer
      if (buffer.trim()) {
        yield this.parseMessage(JSON.parse(buffer));
      }
    } catch (error: unknown) {
      console.error('Error parsing NDJSON:', error);
    } finally {
      stream.releaseLock();
    }
  }
}
