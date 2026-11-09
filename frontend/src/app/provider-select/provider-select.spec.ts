import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { LlmProviderInfo } from '@talkbikes/shared';
import { ProviderSelect } from './provider-select';

const PROVIDERS: LlmProviderInfo[] = [
  { id: 'ollama', label: 'Ollama', description: 'Hosted by us' },
  { id: 'cloudflare', label: 'Cloudflare', description: 'External provider' },
];

describe('ProviderSelect', () => {
  let fixture: ComponentFixture<ProviderSelect>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProviderSelect] }).compileComponents();

    fixture = TestBed.createComponent(ProviderSelect);
    fixture.componentRef.setInput('providers', PROVIDERS);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('shows the selected provider and hides the options by default', () => {
    expect(element.textContent).toContain('Ollama');
    expect(element.querySelector('[role="menu"]')).toBeNull();
  });

  it('lists every provider with its hint when opened', async () => {
    element.querySelector('button')!.click();
    await fixture.whenStable();

    const items = element.querySelectorAll('[role="menuitemradio"]');
    expect(items.length).toBe(2);
    expect(items[1].textContent).toContain('External provider');
  });

  it('updates the selection and closes the menu when an option is chosen', async () => {
    element.querySelector('button')!.click();
    await fixture.whenStable();

    element.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')[1].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.selected()).toBe('cloudflare');
    expect(element.querySelector('[role="menu"]')).toBeNull();
  });
});
