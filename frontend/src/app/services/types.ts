import type { MapLocation } from '@talkbikes/shared';

export type MapMarker = {
  latitude: number;
  longitude: number;
  count: number;
  locations: MapLocation[];
};

export type MapFeatureProperties = {
  count: number;
  detail: string;
  title: string;
};
