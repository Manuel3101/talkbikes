import { ChatMessage } from '@chatwithgbfs/shared';
import { Injectable } from '@nestjs/common';
import ollama from 'ollama';

@Injectable()
export class AppService {
  async *streamChat(question: string): AsyncGenerator<ChatMessage> {
    const id = crypto.randomUUID();

    const stream = await ollama.chat({
      model: 'gemma4:e2b',
      messages: [{ role: 'user', content: question }],
      stream: true,
    });

    // slightly modified version from ollama docs: https://docs.ollama.com/capabilities/streaming#javascript
    let inThinking = false;
    let content = '';

    for await (const chunk of stream) {
      console.log(chunk.message);
      if (chunk.message.thinking) {
        if (!inThinking) {
          inThinking = true;
        }
      } else if (chunk.message.content) {
        if (inThinking) {
          inThinking = false;
        }
        yield { id, role: 'system', content: chunk.message.content };
        content += chunk.message.content;
      }
    }
  }
}
