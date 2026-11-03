import { AfterViewInit, Component, computed, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import type { MapData, MapFeatureProperties, MapLocation } from '@talkbikes/shared';
import type { FeatureCollection, Point } from 'geojson';
import { getVersion, LngLatBounds, Map, NavigationControl, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl';
import { LOCATION_COUNT_LAYER_ID, LOCATIONS_LAYER_ID, LOCATIONS_SOURCE_ID } from '../constants';

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
  protected readonly markers = computed(() => this.locations());

  constructor() {
    effect(() => this.updateMap(this.locations()));
  }

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
        cluster: true,
        clusterRadius: 5,
      });
      this.map?.addLayer({
        id: LOCATIONS_LAYER_ID,
        type: 'circle',
        source: LOCATIONS_SOURCE_ID,
        paint: {
          'circle-color': ['case', ['has', 'point_count'], '#fbbf24', '#34d399'],
          'circle-radius': ['case', ['has', 'point_count'], 13, 6],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });
      this.map?.addLayer({
        id: LOCATION_COUNT_LAYER_ID,
        type: 'symbol',
        source: LOCATIONS_SOURCE_ID,
        layout: {
          'text-field': ['case', ['has', 'point_count'], ['to-string', ['get', 'point_count']], ''],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
        },
        paint: {
          'text-color': '#111827',
        },
      });
      this.addMarkerInteractions();
      this.updateMap(this.locations());
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private updateMap(locations: MapLocation[]): void {
    if (!this.map || !this.mapReady) {
      return;
    }

    const source = this.map.getSource(LOCATIONS_SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(this.toFeatureCollection(locations));

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

  private toFeatureCollection(markers: MapLocation[]): FeatureCollection<Point, MapFeatureProperties> {
    return {
      type: 'FeatureCollection',
      features: markers.map(marker => ({
        type: 'Feature',
        properties: this.toFeatureProperties(marker.details),
        geometry: {
          type: 'Point',
          coordinates: [marker.longitude, marker.latitude],
        },
      })),
    };
  }

  private toFeatureProperties(details: MapLocation['details']): MapFeatureProperties {
    switch (details['kind']) {
      case 'bike':
        return {
          type: 'bike',
          details: { ...details.properties },
        };
      case 'station':
        return {
          type: 'station',
          details: { ...details.properties },
        };
      default:
        return {
          type: 'unknown',
          details: { ...details.properties },
        };
    }
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
