import * as v from 'valibot';

const mapBikeType = v.literal('bike');
const mapStationType = v.literal('station');
const mapUnknownType = v.literal('unknown');

export type MapFeaturePropertiesTypes = v.InferOutput<typeof mapFeaturePropertiesTypes>;
export const mapFeaturePropertiesTypes = v.union([mapBikeType, mapStationType, mapUnknownType]);

const mapBikeDetailsSchema = v.object({
  id: v.string(),
  is_reserved: v.boolean(),
  is_disabled: v.boolean(),
  rental_uris: v.optional(
    v.object({
      android: v.optional(v.string()),
      ios: v.optional(v.string()),
      web: v.optional(v.string()),
    }),
  ),
  last_reported: v.optional(v.number()),
  current_range_meters: v.optional(v.pipe(v.number(), v.minValue(0.0), v.maxValue(1.0))),
  current_fuel_percent: v.optional(v.pipe(v.number(), v.minValue(0.0), v.maxValue(1.0))),
});

const mapStationDetailsSchema = v.object({
  station_id: v.string(),
  name: v.string(),
  short_name: v.optional(v.string()),
  address: v.optional(v.string()),
  cross_street: v.optional(v.string()),
  region_id: v.optional(v.string()),
  post_code: v.optional(v.string()),
  rental_methods: v.optional(
    v.array(
      v.picklist(['key', 'creditcard', 'paypass', 'applepay', 'androidpay', 'transitcard', 'accountnumber', 'phone']),
    ),
  ),
  is_virtual_station: v.optional(v.boolean()),
  parking_type: v.optional(
    v.picklist(['parking_lot', 'street_parking', 'underground_parking', 'sidewalk_parking', 'other']),
  ),
  parking_hoop: v.optional(v.boolean()),
  capacity: v.optional(v.number()),
  is_charging_station: v.optional(v.boolean()),
  rental_uris: v.optional(
    v.object({
      android: v.optional(v.string()),
      ios: v.optional(v.string()),
      web: v.optional(v.string()),
    }),
  ),
});
const mapUnknownDetailsSchema = v.record(v.string(), v.any());

export const mapLocationKindSchema = v.variant('kind', [
  v.object({ kind: mapBikeType, properties: mapBikeDetailsSchema }),
  v.object({ kind: mapStationType, properties: mapStationDetailsSchema }),
  v.object({ kind: mapUnknownType, properties: mapUnknownDetailsSchema }),
]);

export type MapLocation = v.InferOutput<typeof mapLocationSchema>;
export const mapLocationSchema = v.object({
  latitude: v.pipe(v.number(), v.minValue(-90), v.maxValue(90)),
  longitude: v.pipe(v.number(), v.minValue(-180), v.maxValue(180)),
  details: mapLocationKindSchema,
});

export type MapData = v.InferOutput<typeof mapDataSchema>;
export const mapDataSchema = v.union([
  v.object({
    success: v.literal(true),
    locations: v.array(mapLocationSchema),
  }),
  v.object({
    success: v.literal(false),
    error: v.string(),
  }),
]);

export type MapBikeFeatureProperties = v.InferOutput<typeof mapBikeFeaturePropertiesSchema>;
export const mapBikeFeaturePropertiesSchema = v.object({
  type: mapBikeType,
  details: mapBikeDetailsSchema,
});

export type MapStationFeatureProperties = v.InferOutput<typeof mapStationFeaturePropertiesSchema>;
export const mapStationFeaturePropertiesSchema = v.object({
  type: mapStationType,
  details: mapStationDetailsSchema,
});

export type MapUnknownFeatureProperties = v.InferOutput<typeof mapUnknownFeaturePropertiesSchema>;
export const mapUnknownFeaturePropertiesSchema = v.object({
  type: mapUnknownType,
  details: mapUnknownDetailsSchema,
});

export type MapFeatureProperties = v.InferOutput<typeof mapFeaturePropertiesSchema>;
export const mapFeaturePropertiesSchema = v.union([
  mapBikeFeaturePropertiesSchema,
  mapStationFeaturePropertiesSchema,
  mapUnknownFeaturePropertiesSchema,
]);

export type MapFeatureCollection = v.InferOutput<typeof mapFeatureCollectionSchema>;
export const mapFeatureCollectionSchema = v.object({
  type: v.literal('FeatureCollection'),
  features: v.array(mapFeaturePropertiesSchema),
});
