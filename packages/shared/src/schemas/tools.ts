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

export type MapLocation = v.InferOutput<typeof mapLocationSchema>;
export const mapLocationSchema = v.object({
  latitude: v.pipe(v.number(), v.minValue(-90), v.maxValue(90)),
  longitude: v.pipe(v.number(), v.minValue(-180), v.maxValue(180)),
  // TODO: define specific details per tool call when needed
  details: v.record(v.string(), v.unknown()),
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
