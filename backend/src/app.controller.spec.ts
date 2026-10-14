import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';

describe('AppController', () => {
  let _appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    _appController = app.get<AppController>(AppController);
  });

  describe('root', () => {});
});
