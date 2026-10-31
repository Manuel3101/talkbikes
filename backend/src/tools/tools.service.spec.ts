import { Test, TestingModule } from '@nestjs/testing';
import { GbfsModule } from '../gbfs/gbfs.module.ts';
import { GeocodingModule } from '../geocoding/geocoding.module.ts';
import { ToolsService } from './tools.service.js';

describe('ToolsService', () => {
  let service: ToolsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GbfsModule, GeocodingModule],
      providers: [ToolsService],
    }).compile();

    service = module.get<ToolsService>(ToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
