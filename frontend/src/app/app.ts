import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-root',
  template: `<h1>Hello world</h1>`,
})
export class App {
  protected readonly title = signal('frontend');
}
