import { Component, inject, linkedSignal, resource, ResourceStreamItem, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmMessageScrollerImports } from '@spartan-ng/helm/message-scroller';
import type { ChatMessage, MapData } from '@talkbikes/shared';

import { ChatService } from './services/chat.service';
import { SystemMessage as AssistantMessage } from './system-message/system-message';
import { UserMessage } from './user-message/user-message';
import { UserQuestion } from './user-question/user-question';

type ChatRequest = {
  question: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'system',
    content:
      'Guten Tag, ich bin ein KI-gestützter Chatbot, der Ihnen bei Ihren Fragen rund um sharing Angebote helfen kann. Stelle mir einfach eine Frage wie: "Wo finde ich ein E-Bike nahe Köln Hauptbahnhof?" oder "Wo ist die nächste Bikesharing Station von Köln Hauptbahnhof?"',
  },
];

@Component({
  imports: [RouterOutlet, HlmMessageScrollerImports, AssistantMessage, UserMessage, UserQuestion],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly chatService = inject(ChatService);
  protected readonly messages = linkedSignal<ChatMessage | undefined, ChatMessage[]>({
    source: () => this.chatResponse.value(),
    computation: (message, previous) => {
      const messages = previous?.value ?? INITIAL_MESSAGES;
      return message && message.role !== 'tool' ? this.appendMessage(messages, message) : messages;
    },
  });
  protected readonly draftQuestion = signal('');
  private readonly submittedQuestion = signal<ChatRequest | undefined>(undefined);
  protected readonly isStreaming = signal(false);
  protected readonly chatResponse = resource<ChatMessage | undefined, ChatRequest | undefined>({
    params: () => this.submittedQuestion(),
    stream: ({ params, abortSignal }) => {
      const data = signal<ResourceStreamItem<ChatMessage | undefined>>({ value: undefined });
      this.isStreaming.set(true);

      void (async () => {
        try {
          for await (const chunk of this.chatService.send(params.question, abortSignal)) {
            if (abortSignal.aborted) {
              return;
            }
            data.set({ value: chunk });
          }
        } catch (error: unknown) {
          if (!abortSignal.aborted) {
            data.set({ error: error instanceof Error ? error : new Error('Chat request failed') });
          }
        } finally {
          this.isStreaming.set(false);
        }
      })();

      return data;
    },
  });

  private readonly mapDataByMessageId = linkedSignal<ChatMessage | undefined, Record<string, MapData[]>>({
    source: () => this.chatResponse.value(),
    computation: (message, previous) => {
      const dataByMessageId = previous?.value ?? {};
      const toolData = message?.tool_data;

      if (message?.role !== 'tool' || !toolData) {
        return dataByMessageId;
      }

      return {
        ...dataByMessageId,
        [message.id]: [...(dataByMessageId[message.id] ?? []), toolData],
      };
    },
  });

  protected submitQuestion(): void {
    const question = this.draftQuestion().trim();
    if (!question || this.isStreaming()) {
      return;
    }

    this.messages.update(messages => [...messages, { id: crypto.randomUUID(), role: 'user', content: question }]);
    this.draftQuestion.set('');
    this.isStreaming.set(true);
    this.submittedQuestion.set({ question });
  }

  protected mapDataFor(messageId: string): MapData[] {
    return this.mapDataByMessageId()[messageId] ?? [];
  }

  private appendMessage(messages: ChatMessage[], message: ChatMessage): ChatMessage[] {
    const index = messages.findIndex(currentMessage => currentMessage.id === message.id);
    if (index === -1) {
      return [...messages, message];
    }

    return messages.map((currentMessage, currentIndex) =>
      currentIndex === index
        ? {
            ...currentMessage,
            content: currentMessage.content + message.content,
          }
        : currentMessage,
    );
  }
}
