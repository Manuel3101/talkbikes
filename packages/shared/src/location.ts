import type { MapLocation } from './schemas/map.ts';

const EARTH_RADIUS_METERS = 6_371_000;

export type Coordinates = Pick<MapLocation, 'latitude' | 'longitude'>;

/**
 * Calculates the distance between two points on the Earth in meters using the Haversine formula.
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
export function distanceInMeters(first: Coordinates, second: Coordinates): number {
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const a =
    Math.pow(Math.sin(latitudeDelta / 2), 2) +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.pow(Math.sin(longitudeDelta / 2), 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return EARTH_RADIUS_METERS * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
