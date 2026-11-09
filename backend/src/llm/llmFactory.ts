import { Injectable } from '@nestjs/common';
import { DEFAULT_LLM_PROVIDER, type LlmProviderName } from '@talkbikes/shared';
import { CloudflareAdapter } from './adapter/cloudflare.ts';
import { OllamaAdapter } from './adapter/ollama.ts';

@Injectable()
export class LlmFactory {
  constructor(
    private readonly ollama: OllamaAdapter,
    private readonly cloudflare: CloudflareAdapter,
  ) {}

  /**
   * @throws Error if the provider is not supported
   */
  create(provider: LlmProviderName = DEFAULT_LLM_PROVIDER) {
    switch (provider) {
      case 'ollama':
        return this.ollama;

      case 'cloudflare':
        return this.cloudflare;

      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}
