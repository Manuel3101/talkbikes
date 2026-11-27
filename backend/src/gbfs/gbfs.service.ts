import { Injectable } from '@nestjs/common';
import { v23 } from 'gbfs-typescript-types';
import { RedisService } from '../redis/redis.service.ts';

type Provider = 'nextbike_kg';

@Injectable()
export class GbfsService {
  // TODO: add caching of individual endpoints using their ttl values
  private readonly providers: Record<Provider, string> = {
    nextbike_kg: 'https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/gbfs.json',
  };

  constructor(private readonly redis: RedisService) {}

  async getBikeAvailability(): Promise<v23.FreeBikeStatus | null> {
    try {
      const url = await this.getGbfsFileUrl('free_bike_status');
      const response = await fetch(url);
      const data = (await response.json()) as v23.FreeBikeStatus;
      return data;
    } catch (error: unknown) {
      console.error('Error fetching bike availability:', error);
      return null;
    }
  }

  async getStationInformation(): Promise<v23.StationInformation | null> {
    try {
      const url = await this.getGbfsFileUrl('station_information');
      const response = await fetch(url);
      const data = (await response.json()) as v23.StationInformation;

      return data;
    } catch (error: unknown) {
      console.error('Error fetching station information:', error);
      return null;
    }
  }

  async getStationStatus(): Promise<v23.StationStatus | null> {
    try {
      const url = await this.getGbfsFileUrl('station_status');
      const response = await fetch(url);
      const data = (await response.json()) as v23.StationStatus;

      return data;
    } catch (error: unknown) {
      console.error('Error fetching station status:', error);
      return null;
    }
  }

  /**
   * @throws error if the provider is not found or if the fetch fails
   */
  private async getGbfsFile(provider: Provider = 'nextbike_kg'): Promise<v23.Gbfs> {
    const cached = await this.readCache(provider);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(this.providers[provider]);
      const data = (await response.json()) as v23.Gbfs;

      await this.writeCache(provider, data);
      return data;
    } catch (error: unknown) {
      console.error(`Error fetching GBFS for provider ${provider}:`, error);
      throw new Error(`Failed fetching GBFS for provider ${provider}`);
    }
  }

  private cacheKey(provider: Provider): string {
    return `gbfs:${provider}`;
  }

  private async readCache(provider: Provider): Promise<v23.Gbfs | null> {
    try {
      return await this.redis.getJson<v23.Gbfs>(this.cacheKey(provider));
    } catch (error: unknown) {
      console.error(`Error reading GBFS cache for provider ${provider}:`, error);
      return null;
    }
  }

  private async writeCache(provider: Provider, data: v23.Gbfs): Promise<void> {
    const age = Math.floor(Date.now() / 1000) - data.last_updated;
    const remainingTtl = Math.floor(data.ttl - age);
    if (!(remainingTtl > 0)) {
      return;
    }

    try {
      await this.redis.setJson(this.cacheKey(provider), data, remainingTtl);
    } catch (error: unknown) {
      console.error(`Error writing GBFS cache for provider ${provider}:`, error);
    }
  }

  private async getGbfsFileUrl(dataType: string, provider: Provider = 'nextbike_kg'): Promise<string> {
    try {
      const gbfs = await this.getGbfsFile(provider);
      //@ts-expect-error library is badly typed
      const url = gbfs?.data.de.feeds.find(item => item.name === dataType)?.url;
      return url;
    } catch (error: unknown) {
      console.error(`Error fetching GBFS file URL for provider ${provider}:`, error);
      throw error;
    }
  }
}
