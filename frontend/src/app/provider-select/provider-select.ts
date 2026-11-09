import { Component, computed, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { DEFAULT_LLM_PROVIDER, type LlmProviderInfo, type LlmProviderName } from '@talkbikes/shared';

@Component({
  selector: 'app-provider-select',
  templateUrl: './provider-select.html',
  host: {
    class: 'relative block',
    '(document:click)': 'closeOnOutsideClick($event)',
    '(keydown.escape)': 'close(true)',
  },
})
export class ProviderSelect {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  readonly providers = input.required<readonly LlmProviderInfo[]>();
  readonly disabled = input(false);
  readonly selected = model<LlmProviderName>(DEFAULT_LLM_PROVIDER);

  protected readonly isOpen = signal(false);
  protected readonly selectedLabel = computed(
    () => this.providers().find(provider => provider.id === this.selected())?.label ?? this.selected(),
  );

  protected toggle(): void {
    this.isOpen.update(isOpen => !isOpen);
  }

  protected select(provider: LlmProviderInfo): void {
    this.selected.set(provider.id);
    this.close(true);
  }

  protected close(restoreFocus = false): void {
    if (!this.isOpen()) {
      return;
    }

    this.isOpen.set(false);
    if (restoreFocus) {
      this.trigger().nativeElement.focus();
    }
  }

  protected closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
