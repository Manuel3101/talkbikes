import { Component, input } from '@angular/core';
import { ChatMessage } from '@talkbikes/shared';

@Component({
  imports: [],
  selector: 'app-user-message',
  templateUrl: './user-message.html',
})
export class UserMessage {
  public message = input.required<ChatMessage>();
}
