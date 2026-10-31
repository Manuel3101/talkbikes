import { AfterViewInit, Component, computed, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { distanceInMeters, type MapData, type MapLocation } from '@talkbikes/shared';
import type { FeatureCollection, Point } from 'geojson';
import { getVersion, LngLatBounds, Map, NavigationControl, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl';
import {
  CLUSTER_DISTANCE_METERS,
  LOCATION_COUNT_LAYER_ID,
  LOCATIONS_LAYER_ID,
  LOCATIONS_SOURCE_ID,
} from '../constants';
import { MapFeatureProperties, MapMarker } from '../services/types';

setWorkerUrl(new URL(`maplibre-gl-worker.mjs?v=${getVersion()}`, document.baseURI).toString());

@Component({
  selector: 'app-bike-map',
  templateUrl: './bike-map.html',
})
export class BikeMap implements AfterViewInit, OnDestroy {
  public readonly toolData = input.required<MapData[]>();

  private readonly mapElement = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private map: Map | undefined;
  private mapReady = false;

  protected readonly locations = computed(() =>
    this.toolData().flatMap(result => (result.success ? result.locations : [])),
  );
  protected readonly markers = computed(() => this.clusterLocations(this.locations()));

  ngAfterViewInit(): void {
    this.map = new Map({
      container: this.mapElement().nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [6.9603, 50.9375], // TODO: infer based on first location or user provided location
      zoom: 11,
    });
    this.map.addControl(new NavigationControl(), 'top-right');
    this.map.on('load', () => {
      this.mapReady = true;
      this.map?.addSource(LOCATIONS_SOURCE_ID, {
        type: 'geojson',
        data: this.toFeatureCollection(this.markers()),
      });
      this.map?.addLayer({
        id: LOCATIONS_LAYER_ID,
        type: 'circle',
        source: LOCATIONS_SOURCE_ID,
        paint: {
          'circle-color': ['case', ['>', ['get', 'count'], 1], '#f59e0b', '#34d399'],
          'circle-radius': ['case', ['>', ['get', 'count'], 1], 13, 6],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });
      this.map?.addLayer({
        id: LOCATION_COUNT_LAYER_ID,
        type: 'symbol',
        source: LOCATIONS_SOURCE_ID,
        layout: {
          'text-field': ['case', ['>', ['get', 'count'], 1], ['to-string', ['get', 'count']], ''],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
        },
        paint: {
          'text-color': '#111827',
        },
      });
      this.addMarkerInteractions();
      this.updateMap(this.locations(), this.markers());
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private clusterLocations(locations: MapLocation[]): MapMarker[] {
    const remaining = [...locations];
    const clusters: MapLocation[][] = [];

    while (remaining.length > 0) {
      const first = remaining.shift();
      if (!first) {
        break;
      }

      const cluster = [first];
      for (let index = remaining.length - 1; index >= 0; index -= 1) {
        if (distanceInMeters(first, remaining[index]) <= CLUSTER_DISTANCE_METERS) {
          cluster.push(remaining.splice(index, 1)[0]);
        }
      }
      clusters.push(cluster);
    }

    return clusters.map(cluster => {
      const totals = cluster.reduce(
        (sum, location) => ({
          latitude: sum.latitude + location.latitude,
          longitude: sum.longitude + location.longitude,
        }),
        { latitude: 0, longitude: 0 },
      );

      return {
        latitude: totals.latitude / cluster.length,
        longitude: totals.longitude / cluster.length,
        count: cluster.length,
        locations: cluster,
      };
    });
  }

  private updateMap(locations: MapLocation[], markers: MapMarker[]): void {
    if (!this.map || !this.mapReady) {
      return;
    }

    const source = this.map.getSource(LOCATIONS_SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(this.toFeatureCollection(markers));

    if (locations.length === 0) {
      return;
    }

    const bounds = new LngLatBounds();
    for (const location of locations) {
      bounds.extend([location.longitude, location.latitude]);
    }

    if (locations.length === 1) {
      this.map.flyTo({ center: [locations[0].longitude, locations[0].latitude], zoom: 17 });
      return;
    }

    this.map.fitBounds(bounds, { padding: 48, maxZoom: 17 });
  }

  private toFeatureCollection(markers: MapMarker[]): FeatureCollection<Point, MapFeatureProperties> {
    return {
      type: 'FeatureCollection',
      features: markers.map(marker => ({
        type: 'Feature',
        properties: this.toFeatureProperties(marker),
        geometry: {
          type: 'Point',
          coordinates: [marker.longitude, marker.latitude],
        },
      })),
    };
  }

  private toFeatureProperties(marker: MapMarker): MapFeatureProperties {
    if (marker.count === 1) {
      const [location] = marker.locations;
      return {
        count: 1,
        title: this.getLocationTitle(location),
        detail: '',
      };
    }

    return {
      count: marker.count,
      title: `${marker.count} nearby results`,
      detail: `${marker.count} locations share this position`,
    };
  }

  private getLocationTitle(location: MapLocation): string {
    const name = location.details['name'];
    if (typeof name === 'string' && name.trim() !== '') {
      return name;
    }

    const kind = location.details['kind'];
    return kind === 'bike' ? 'Available bike' : 'Bike-sharing station';
  }

  private addMarkerInteractions(): void {
    this.map?.on('mouseenter', LOCATIONS_LAYER_ID, () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = 'pointer';
      }
    });
    this.map?.on('mouseleave', LOCATIONS_LAYER_ID, () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = '';
      }
    });
  }
}
