import * as v from 'valibot';

export type ChatMessage = v.InferOutput<typeof chatMessageSchema>;
export const chatMessageSchema = v.object({
  id: v.string(),
  role: v.union([v.literal('user'), v.literal('system'), v.literal('assistant')]),
  content: v.string(),
});

export type UserQuestion = v.InferOutput<typeof userQuestionSchema>;
export const userQuestionSchema = v.object({
  question: v.string(),
});
