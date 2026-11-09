import { Service } from '@angular/core';
import { type ChatMessage, chatMessageSchema, validateInput } from '@talkbikes/shared';

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
    const { success, output, issues } = validateInput(chatMessageSchema, value);
    if (!success) {
      const details = issues
        .slice(0, 5)
        .map(issue => `${issue.path?.map(segment => String(segment.key)).join('.') || '(root)'}: ${issue.message}`)
        .join('; ');
      console.error('Invalid chat message:', value);
      throw new Error(`Invalid chat message: ${details}`);
    }

    return output;
  }
}
