import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-system-message',
  templateUrl: './system-message.html',
})
export class SystemMessage {
  public message = input.required<{ id: string; role: 'user' | 'system'; content: string }>();
}
