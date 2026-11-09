import { Injectable } from '@nestjs/common';
import type { ChatMessage, LlmProviderInfo, LlmProviderName } from '@talkbikes/shared';
import { SYSTEM_PROMPT } from '../constants.ts';
import { LlmOrchestrator } from '../types/llmProvider.ts';
import { LlmFactory } from './llmFactory.ts';
import { LLM_PROVIDERS } from './providers.ts';

@Injectable()
export class LlmService implements LlmOrchestrator {
  constructor(private readonly llmFactory: LlmFactory) {}

  public async *orchestrateLlmRequest(
    question: string,
    options: { provider: LlmProviderName },
  ): AsyncIterable<ChatMessage> {
    const id = crypto.randomUUID();
    // TODO: need to send entire chat history instead of just the last user question
    const messages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      { id, role: 'user', content: question },
    ];
    const provider = this.llmFactory.create(options.provider);
    yield* provider.streamChat({ id, messages });
  }

  public listProviders(): readonly LlmProviderInfo[] {
    return LLM_PROVIDERS;
  }
}
