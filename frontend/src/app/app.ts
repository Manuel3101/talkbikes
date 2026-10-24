import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmMessageScrollerImports } from '@spartan-ng/helm/message-scroller';
import type { ChatMessage, ProcessedToolData } from '@talkbikes/shared';
import { ChatService } from './services/chat.service';
import { SystemMessage as AssistantMessage } from './system-message/system-message';
import { UserMessage } from './user-message/user-message';
import { UserQuestion } from './user-question/user-question';

@Component({
  imports: [RouterOutlet, HlmMessageScrollerImports, AssistantMessage, UserMessage, UserQuestion],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly chatService = inject(ChatService);
  protected readonly title = signal('Talkbikes');
  protected readonly isStreaming = signal(false);
  protected messages = signal<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content:
        'Guten Tag, ich bin ein KI-gestützter Chatbot, der Ihnen bei Ihren Fragen rund um sharing Angebote helfen kann. Stelle mir einfach eine Frage wie: "Wo finde ich ein ebike nahe Köln Hauptbahnhof?" oder "Wo ist die nächste Bikesharing Station von Köln Haupfbahnhof?"',
    },
  ]);

  protected async submitQuestion(question: string): Promise<void> {
    if (this.isStreaming()) {
      return;
    }

    this.messages.update(messages => [...messages, { id: crypto.randomUUID(), role: 'user', content: question }]);
    this.isStreaming.set(true);

    try {
      for await (const message of this.chatService.send(question)) {
        this.messages.update(messages => {
          const existingMessage = messages.some(currentMessage => currentMessage.id === message.id);

        this.messages.update(messages => {
          const index = messages.findIndex(currentMessage => currentMessage.id === message.id);

          if (index === -1) {
            return [...messages, message];
          }

          const existingMessage = messages[index];
          return messages.map((currentMessage, i) =>
            i === index ? { ...existingMessage, content: existingMessage.content + message.content } : currentMessage,
          );
        });
      }
    } catch (error: unknown) {
      console.error(error);
      this.messages.update(messages => [
        ...messages,
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: 'I could not send that question. Please try again.',
        },
      ]);
    } finally {
      this.isStreaming.set(false);
    }
  }
}
