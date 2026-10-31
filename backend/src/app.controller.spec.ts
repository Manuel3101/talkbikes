import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.ts';
import { GbfsModule } from './gbfs/gbfs.module.ts';
import { GeocodingModule } from './geocoding/geocoding.module.ts';
import { LlmModule } from './llm/llm.module.ts';
import { ToolsService } from './tools/tools.service.ts';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [GbfsModule, GeocodingModule, LlmModule],
      controllers: [AppController],
      providers: [ToolsService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('creates the controller with its dependencies', () => {
    expect(appController).toBeInstanceOf(AppController);
  });
});
