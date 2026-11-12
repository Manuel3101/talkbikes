import type { ChatMessage, ConversationMessage, LlmProviderName } from '@talkbikes/shared';

export type Input = {
  id: ReturnType<typeof crypto.randomUUID>;
  messages: ChatMessage[];
};

export interface LlmProvider {
  streamChat({ id, messages }: Input): AsyncIterable<ChatMessage>;
}

export interface LlmOrchestrator {
  orchestrateLlmRequest(
    conversation: ConversationMessage[],
    options: { id: Input['id']; provider: LlmProviderName },
  ): AsyncIterable<ChatMessage>;
}
