import { Injectable } from '@nestjs/common';
import { v23 } from 'gbfs-typescript-types';

type Provider = 'nextbike_kg';

@Injectable()
export class GbfsService {
  // TODO: add actual discovery of gbfs endpoints per provider
  // TODO: add caching of individual endpoints using their ttl values
  private readonly providers: Record<Provider, string> = {
    nextbike_kg: 'https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/gbfs.json',
  };

  async getBikeAvailability(): Promise<v23.FreeBikeStatus | null> {
    try {
      const response = await fetch('https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/de/free_bike_status.json');
      const data = (await response.json()) as v23.FreeBikeStatus;

      return data;
    } catch (error: unknown) {
      console.error('Error fetching bike availability:', error);
      return null;
    }
  }

  async getStationInformation(): Promise<v23.StationInformation | null> {
    try {
      const response = await fetch('https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/de/station_information.json');
      const data = (await response.json()) as v23.StationInformation;

      return data;
    } catch (error: unknown) {
      console.error('Error fetching station information:', error);
      return null;
    }
  }

  async getStationStatus(): Promise<v23.StationStatus | null> {
    try {
      const response = await fetch('https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/de/station_status.json');
      const data = (await response.json()) as v23.StationStatus;

      return data;
    } catch (error: unknown) {
      console.error('Error fetching station status:', error);
      return null;
    }
  }
}
