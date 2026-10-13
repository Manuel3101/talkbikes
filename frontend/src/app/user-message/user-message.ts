import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-user-message',
  templateUrl: './user-message.html',
})
export class UserMessage {
  public message = input.required<{ id: string; role: 'user' | 'system'; content: string }>();
}
