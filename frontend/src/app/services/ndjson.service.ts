import { Service } from '@angular/core';
import { ChatMessage, chatMessageSchema, validateInput } from '@talkbikes/shared';

@Service()
export class Ndjson {
  public async *parseNDJSON(stream: ReadableStreamDefaultReader<Uint8Array>) {
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
    } finally {
      stream.releaseLock();
    }
  }

  private parseMessage(value: unknown): ChatMessage {
    const { success, output } = validateInput(chatMessageSchema, value);
    if (!success) {
      console.error('Invalid chat message:', output);
      throw new Error(`Invalid chat message: ${output}`);
    }

    return output;
  }
}
