import * as v from 'valibot';
import { modelToolCallSchema } from './tools.ts';

export type ChatMessage = v.InferOutput<typeof chatMessageSchema>;
export const chatMessageSchema = v.object({
  id: v.string(),
  role: v.union([v.literal('user'), v.literal('system'), v.literal('assistant'), v.literal('tool')]),
  content: v.string(),
  thinking: v.optional(v.string()),
  tool_calls: v.optional(v.array(modelToolCallSchema)),
  tool_name: v.optional(v.string()),
});

export type UserQuestion = v.InferOutput<typeof userQuestionSchema>;
export const userQuestionSchema = v.object({
  question: v.string(),
});
