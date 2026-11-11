import * as v from 'valibot';
import { mapLocationSchema } from './map.ts';

export type SseEventName = v.InferOutput<typeof sseEventNameSchema>;
export const sseEventNameSchema = v.picklist(['start', 'content', 'tool', 'end', 'error']);

export type SseStartData = v.InferOutput<typeof sseStartDataSchema>;
export const sseStartDataSchema = v.object({ id: v.string() });

export type SseContentData = v.InferOutput<typeof sseContentDataSchema>;
export const sseContentDataSchema = v.object({ content: v.string() });

export type SseToolData = v.InferOutput<typeof sseToolDataSchema>;
export const sseToolDataSchema = v.array(mapLocationSchema);

export type SseEndData = v.InferOutput<typeof sseEndDataSchema>;
export const sseEndDataSchema = v.object({ id: v.string() });

export type SseErrorData = v.InferOutput<typeof sseErrorDataSchema>;
export const sseErrorDataSchema = v.object({ message: v.string() });

export type SseEvent = v.InferOutput<typeof sseEventSchema>;
export const sseEventSchema = v.variant('event', [
  v.object({ event: v.literal('start'), data: sseStartDataSchema }),
  v.object({ event: v.literal('content'), data: sseContentDataSchema }),
  v.object({ event: v.literal('tool'), data: sseToolDataSchema }),
  v.object({ event: v.literal('end'), data: sseEndDataSchema }),
  v.object({ event: v.literal('error'), data: sseErrorDataSchema }),
]);
