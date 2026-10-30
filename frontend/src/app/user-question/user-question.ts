import { Component, input, model, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-user-question',
  templateUrl: './user-question.html',
})
export class UserQuestion {
  readonly isSubmitting = input(false);
  readonly question = model('');
  readonly questionSubmitted = output<void>();

  protected submit(event: SubmitEvent): void {
    event.preventDefault();

    if (!this.question().trim() || this.isSubmitting()) {
      return;
    }

    this.questionSubmitted.emit();
  }
}
