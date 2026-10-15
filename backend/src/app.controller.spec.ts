import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { ToolsService } from './tools/tools.service.ts';

describe('AppController', () => {
  let _appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, ToolsService],
    }).compile();

    _appController = app.get<AppController>(AppController);
  });

  it('creates the controller with its dependencies', () => {
    expect(_appController).toBeInstanceOf(AppController);
  });
});
