import { Injectable } from '@nestjs/common';
import { v23 } from 'gbfs-typescript-types';

type Provider = 'nextbike_kg';

@Injectable()
export class GbfsService {
  // TODO: add caching of individual endpoints using their ttl values
  private readonly providers: Record<Provider, string> = {
    nextbike_kg: 'https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/gbfs.json',
  };
  private cache: Partial<Record<Provider, v23.Gbfs>> = {};

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
    const cached = this.cache[provider];
    if (cached && this.isCacheFresh(cached)) {
      console.debug(`Using cached GBFS data for provider ${provider}`);
      return cached;
    }

    try {
      const response = await fetch(this.providers[provider]);
      const data = (await response.json()) as v23.Gbfs;
      console.debug('Caching data for gbfs file:  ', data);

      this.cache[provider] = data;
      return data;
    } catch (error: unknown) {
      console.error(`Error fetching GBFS for provider ${provider}:`, error);
      throw new Error(`Failed fetching GBFS for provider ${provider}`);
    }
  }

  private isCacheFresh(data: v23.Gbfs): boolean {
    const age = Math.floor(Date.now() / 1000) - data.last_updated;

    return age < data.ttl;
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
