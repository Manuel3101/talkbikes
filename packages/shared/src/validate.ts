import * as v from 'valibot';

export function validateInput<TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  schema: TSchema,
  data: unknown,
): v.SafeParseResult<TSchema> {
  return v.safeParse(schema, data);
}
