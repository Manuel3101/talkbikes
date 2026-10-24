import { inject, Service } from '@angular/core';
import { ChatMessage } from '@talkbikes/shared';
import { Ndjson } from './ndjson.service';

// TODO: replace with .env variable
const CHAT_ENDPOINT = 'http://localhost:3000/chat';

@Service()
export class ChatService {
  private ndjson = inject(Ndjson);
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

    yield* this.ndjson.parseNDJSON(reader);
  }
}
