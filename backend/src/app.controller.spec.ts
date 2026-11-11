import { Test, TestingModule } from '@nestjs/testing';
import { llmProviderNameSchema } from '@talkbikes/shared';
import { AppController } from './app.controller.ts';
import { GbfsModule } from './gbfs/gbfs.module.ts';
import { GeocodingModule } from './geocoding/geocoding.module.ts';
import { LlmModule } from './llm/llm.module.ts';
import { SseService } from './sse/sse.service.ts';
import { ToolsService } from './tools/tools.service.ts';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [GbfsModule, GeocodingModule, LlmModule],
      controllers: [AppController],
      providers: [ToolsService, SseService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('creates the controller with its dependencies', () => {
    expect(appController).toBeInstanceOf(AppController);
  });

  it('lists every supported provider with a label and description', () => {
    const providers = appController.listProviders();

    expect(providers.map(provider => provider.id)).toEqual(llmProviderNameSchema.options);
    for (const provider of providers) {
      expect(provider.label).not.toBe('');
      expect(provider.description).not.toBe('');
    }
  });
});
