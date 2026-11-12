import { Component, DestroyRef, inject, resource, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmMessageScrollerImports } from '@spartan-ng/helm/message-scroller';
import type {
  ChatMessage,
  UserQuestion as ChatRequest,
  LlmProviderName,
  MapLocation,
  SseEvent,
} from '@talkbikes/shared';
import { DEFAULT_LLM_PROVIDER } from '@talkbikes/shared';

import { ProviderSelect } from './provider-select/provider-select';
import { ChatService } from './services/chat.service';
import { SystemMessage as AssistantMessage } from './system-message/system-message';
import { UserMessage } from './user-message/user-message';
import { UserQuestion } from './user-question/user-question';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'system',
    content:
      'Guten Tag, ich bin ein KI-gestützter Chatbot, der Ihnen bei Ihren Fragen rund um sharing Angebote helfen kann. Stelle mir einfach eine Frage wie: "Wo finde ich ein E-Bike nahe Köln Hauptbahnhof?" oder "Wo ist die nächste Bikesharing Station von Köln Hauptbahnhof?"',
  },
];

@Component({
  imports: [RouterOutlet, HlmMessageScrollerImports, AssistantMessage, UserMessage, UserQuestion, ProviderSelect],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly chatService = inject(ChatService);
  private abortController: AbortController | undefined;

  protected readonly messages = signal<ChatMessage[]>(INITIAL_MESSAGES);
  protected readonly draftQuestion = signal('Wo finde ich freie Fahrräder nahe Köln Hbf im Umkreis von 500 Meter?');
  protected readonly selectedProvider = signal<LlmProviderName>(DEFAULT_LLM_PROVIDER);
  /**
   * Providers offered by the backend. If loading fails the selector is hidden
   * and the backend falls back to its default provider.
   */
  protected readonly providers = resource({
    loader: ({ abortSignal }) => this.chatService.listProviders(abortSignal),
  });
  protected readonly isStreaming = signal(false);
  /**
   * Message of the last failed request, shown until the next question is submitted
   */
  protected readonly errorMessage = signal<string | undefined>(undefined);
  /**
   * Locations received via `tool` events for each assistant message by its `id`
   */
  protected readonly locationsByMessageId = signal<Record<string, MapLocation[]>>({});

  constructor() {
    inject(DestroyRef).onDestroy(() => this.abortController?.abort());
  }

  protected submitQuestion(): void {
    const question = this.draftQuestion().trim();
    if (!question || this.isStreaming()) {
      return;
    }

    this.messages.update(messages => [...messages, { id: crypto.randomUUID(), role: 'user', content: question }]);
    this.draftQuestion.set('');
    this.errorMessage.set(undefined);
    void this.streamAnswer({ question, provider: this.selectedProvider() });
  }

  private async streamAnswer(request: ChatRequest): Promise<void> {
    const abortController = new AbortController();
    this.abortController = abortController;
    this.isStreaming.set(true);

    try {
      let messageId: string | undefined;
      for await (const event of this.chatService.send(request, abortController.signal)) {
        if (abortController.signal.aborted) {
          return;
        }

        if (event.event === 'start') {
          messageId = event.data.id;
        } else if (event.event === 'end' || event.event === 'error') {
          this.handleTerminalEvent(event);
          return;
        } else if (messageId) {
          this.handleMessageEvent(messageId, event);
        }
      }
    } catch (error: unknown) {
      if (!abortController.signal.aborted) {
        this.errorMessage.set(error instanceof Error ? error.message : 'Chat request failed');
      }
    } finally {
      this.isStreaming.set(false);
    }
  }

  private handleTerminalEvent(event: Extract<SseEvent, { event: 'end' | 'error' }>): void {
    if (event.event === 'error') {
      this.errorMessage.set(event.data.message);
    }
  }

  private handleMessageEvent(id: string, event: Extract<SseEvent, { event: 'content' | 'tool' }>): void {
    if (event.event === 'content') {
      this.ensureAssistantMessage(id);
      this.messages.update(messages =>
        messages.map(message =>
          message.id === id ? { ...message, content: message.content + event.data.content } : message,
        ),
      );
    } else {
      this.locationsByMessageId.update(locationsByMessageId => ({
        ...locationsByMessageId,
        [id]: [...(locationsByMessageId[id] ?? []), ...event.data],
      }));
    }
  }

  private ensureAssistantMessage(id: string): void {
    if (this.messages().some(message => message.id === id)) {
      return;
    }

    this.messages.update(messages => [...messages, { id, role: 'assistant', content: '' }]);
  }
}
