import type { LlmProviderInfo } from '@talkbikes/shared';

export const LLM_PROVIDERS: readonly LlmProviderInfo[] = [
  {
    id: 'ollama',
    label: 'Ollama',
    description: 'Verarbeitung durch unsere selbst gehosteten Modelle',
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare',
    description: 'Externer Anbieter, keine Datenspeicherung (Zero Data Retention)',
  },
];
