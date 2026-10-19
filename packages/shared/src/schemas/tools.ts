import * as v from 'valibot';

export type ToolArguments = v.InferOutput<typeof toolArgumentsSchema>;
export const toolArgumentsSchema = v.record(v.string(), v.unknown());

export type ToolDefinition = v.InferOutput<typeof toolDefinitionSchema>;
export const toolDefinitionSchema = v.object({
  type: v.literal('function'),
  function: v.object({
    name: v.string(),
    description: v.string(),
    parameters: v.object({
      type: v.literal('object'),
      properties: v.record(v.string(), v.object({ type: v.string(), description: v.string() })),
      required: v.array(v.string()),
    }),
  }),
});

export type ModelToolCall = v.InferOutput<typeof modelToolCallSchema>;
export const modelToolCallSchema = v.object({
  function: v.object({
    name: v.string(),
    arguments: toolArgumentsSchema,
  }),
});

export type BikeAvailabilityTool = v.InferOutput<typeof bikeAvailabilityToolSchema>;
export const bikeAvailabilityToolSchema = v.union([
  v.object({
    success: v.literal(true),
    availableBikes: v.array(
      v.object({
        stationId: v.optional(v.string()),
        type: v.string(),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
      }),
    ),
  }),
  v.object({
    success: v.literal(false),
    error: v.string(),
  }),
]);

export type StationInformationTool = v.InferOutput<typeof stationInformationToolSchema>;
export const stationInformationToolSchema = v.union([
  v.object({
    success: v.literal(true),
    stations: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        address: v.optional(v.string()),
      }),
    ),
  }),
  v.object({
    success: v.literal(false),
    error: v.string(),
  }),
]);

export type StationStatusTool = v.InferOutput<typeof stationStatusToolSchema>;
export const stationStatusToolSchema = v.union([
  v.object({
    success: v.literal(true),
    stations: v.array(
      v.object({
        id: v.string(),
        numDocksAvailable: v.optional(v.number()),
        numBikesAvailable: v.number(),
        isInstalled: v.boolean(),
        isRenting: v.boolean(),
        isReturning: v.boolean(),
      }),
    ),
  }),
  v.object({
    success: v.literal(false),
    error: v.string(),
  }),
]);
