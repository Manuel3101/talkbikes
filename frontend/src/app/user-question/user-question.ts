import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-user-question',
  templateUrl: './user-question.html',
})
export class UserQuestion {
  readonly isSubmitting = input(false);
  readonly questionSubmitted = output<string>();

  protected submit(event: SubmitEvent, textarea: HTMLTextAreaElement): void {
    event.preventDefault();

    const question = textarea.value.trim();
    if (!question || this.isSubmitting()) {
      return;
    }

    this.questionSubmitted.emit(question);
    textarea.value = '';
  }
}
