import { inject, Service } from '@angular/core';
import type { ChatMessage, LlmProviderInfo, UserQuestion } from '@talkbikes/shared';
import { Ndjson } from './ndjson.service';

// TODO: replace with .env variable
const API_URL = 'http://localhost:3000';
const CHAT_ENDPOINT = `${API_URL}/chat`;
const PROVIDERS_ENDPOINT = `${API_URL}/providers`;

@Service()
export class ChatService {
  private ndjson = inject(Ndjson);
  // TODO: add options object for things like "stream=true"
  async listProviders(signal?: AbortSignal): Promise<LlmProviderInfo[]> {
    const response = await fetch(PROVIDERS_ENDPOINT, { headers: { Accept: 'application/json' }, signal });

    if (!response.ok) {
      throw new Error(`Provider request failed with status ${response.status}`);
    }

    const data = (await response.json()) as LlmProviderInfo[];
    return data;
  }

  async *send(request: UserQuestion, signal?: AbortSignal): AsyncGenerator<ChatMessage> {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/x-ndjson',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
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
