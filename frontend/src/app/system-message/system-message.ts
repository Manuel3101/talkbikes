import { Component, input } from '@angular/core';
import { ChatMessage } from '@chatwithgbfs/shared';

@Component({
  imports: [],
  selector: 'app-system-message',
  templateUrl: './system-message.html',
})
export class SystemMessage {
  public message = input.required<ChatMessage>();
}
