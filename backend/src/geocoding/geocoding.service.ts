import { Injectable } from '@nestjs/common';
import type { Coordinates } from '@talkbikes/shared';

type NominatimSearchResult = {
  lat: string;
  lon: string;
};

@Injectable()
export class GeocodingService {
  async findCoordinates(location: string): Promise<Coordinates | null> {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', location);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Talkbikes/1.0',
        },
      });
      if (!response.ok) {
        return null;
      }

      const [result] = (await response.json()) as NominatimSearchResult[];
      if (!result) {
        return null;
      }

      const latitude = Number(result.lat);
      const longitude = Number(result.lon);
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return null;
      }

      return { latitude, longitude };
    } catch (error: unknown) {
      console.error(`Failed to geocode location "${location}":`, error);
      return null;
    }
  }
}
