import { Test, TestingModule } from '@nestjs/testing';
import { GbfsModule } from '../gbfs/gbfs.module.ts';
import { ToolsModule } from '../tools/tools.module.ts';
import { CloudflareAdapter } from './adapter/cloudflare.ts';
import { OllamaAdapter } from './adapter/ollama.ts';
import { LlmService } from './llm.service.js';

describe('LlmService', () => {
  let service: LlmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GbfsModule, ToolsModule],
      providers: [LlmService, OllamaAdapter, CloudflareAdapter],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
