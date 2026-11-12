import { Injectable } from '@nestjs/common';
import type { ChatMessage, ConversationMessage, LlmProviderInfo, LlmProviderName } from '@talkbikes/shared';
import { SYSTEM_PROMPT } from '../constants.ts';
import type { Input, LlmOrchestrator } from '../types/llmProvider.ts';
import { LlmFactory } from './llmFactory.ts';
import { LLM_PROVIDERS } from './providers.ts';

@Injectable()
export class LlmService implements LlmOrchestrator {
  constructor(private readonly llmFactory: LlmFactory) {}

  public async *orchestrateLlmRequest(
    conversation: ConversationMessage[],
    options: { id: Input['id']; provider: LlmProviderName },
  ): AsyncIterable<ChatMessage> {
    const { id } = options;
    const messages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...conversation.map(({ role, content }) => ({ id: crypto.randomUUID(), role, content })),
    ];
    const provider = this.llmFactory.create(options.provider);
    yield* provider.streamChat({ id, messages });
  }

  public listProviders(): readonly LlmProviderInfo[] {
    return LLM_PROVIDERS;
  }
}
