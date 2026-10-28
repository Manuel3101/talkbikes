import { Service } from '@angular/core';
import { MapLocation } from '@talkbikes/shared';

const EARTH_RADIUS_METERS = 6_371_000;

@Service()
export class Location {
  /**
   * Calculates the distance between two points on the Earth in meters using the Haversine formula.
   * @see https://en.wikipedia.org/wiki/Haversine_formula
   */
  public distanceInMeters(first: MapLocation, second: MapLocation): number {
    const latitudeDelta = this.toRadians(second.latitude - first.latitude);
    const longitudeDelta = this.toRadians(second.longitude - first.longitude);
    const firstLatitude = this.toRadians(first.latitude);
    const secondLatitude = this.toRadians(second.latitude);

    const a =
      Math.pow(Math.sin(latitudeDelta / 2), 2) +
      Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.pow(Math.sin(longitudeDelta / 2), 2);
    const c = 2 * Math.asin(Math.sqrt(a));
    return EARTH_RADIUS_METERS * c;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
