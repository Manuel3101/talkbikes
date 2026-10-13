import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmMessageScrollerImports } from '@spartan-ng/helm/message-scroller';
import { SystemMessage } from './system-message/system-message';
import { UserMessage } from './user-message/user-message';

@Component({
  imports: [RouterOutlet, HlmMessageScrollerImports, SystemMessage, UserMessage],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
  // TODO: stream into messages from a service
  protected messages = signal<{ id: string; role: 'user' | 'system'; content: string }[]>([
    {
      id: '1',
      role: 'system',
      content:
        'Good morning! I can help you explore transit feeds, station availability, and service status. What would you like to know?',
    },
    { id: '2', role: 'user', content: 'Which stations have the most available bikes right now?' },
    {
      id: '3',
      role: 'system',
      content:
        'I’ll check the latest feed data and compare availability across stations. One moment while I look through the network.',
    },
    {
      id: '4',
      role: 'system',
      content: `The busiest stations with available bikes are: Central Station — 18 bikes, Riverside Park — 14 bikes and Market Square — 11 bikes
    `,
    },
  ]);
}
