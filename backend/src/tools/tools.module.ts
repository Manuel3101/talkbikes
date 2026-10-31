import { Module } from '@nestjs/common';
import { GbfsModule } from '../gbfs/gbfs.module.ts';
import { GeocodingModule } from '../geocoding/geocoding.module.ts';
import { ToolsService } from './tools.service.ts';

@Module({
  providers: [ToolsService],
  exports: [ToolsService],
  imports: [GbfsModule, GeocodingModule],
})
export class ToolsModule {}
