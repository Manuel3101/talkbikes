import * as v from 'valibot';
import { validateInput } from '../../validate.ts';

export type CloudflareConfig = v.InferOutput<typeof cloudflareConfigSchema>;
export const cloudflareConfigSchema = v.object({
  CLOUDFLARE_ACCOUNT_ID: v.optional(v.pipe(v.string(), v.nonEmpty())),
  CLOUDFLARE_API_TOKEN: v.optional(v.pipe(v.string(), v.nonEmpty())),
});

export function getCloudflareConfig(): CloudflareConfig {
  const { success, output, issues } = validateInput(cloudflareConfigSchema, process.env);

  if (!success) {
    console.error('No variables found');
    const messages = issues.map(issue => issue.message).join(', ');
    throw new Error(`Cloudflare config not setup: ${messages}`);
  }

  return output;
}
