import { Injectable } from '@nestjs/common';
import type { ChatMessage, ModelToolCall } from '@talkbikes/shared';
import { getCloudflareConfig } from '@talkbikes/shared/env';

import { ToolsService } from '../../tools/tools.service.ts';

import type { Input, LlmProvider } from '../../types/llmProvider.ts';

const MODEL = '@cf/mistralai/mistral-small-3.1-24b-instruct';

type StreamChunk = {
  choices?: {
    delta?: {
      content?: string | number | null;
      tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[];
    };
  }[];
};

@Injectable()
export class CloudflareAdapter implements LlmProvider {
  constructor(private readonly toolsService: ToolsService) {}

  async *streamChat({ id, messages }: Input): AsyncIterable<ChatMessage> {
    while (true) {
      let content = '';
      const pendingToolCalls = new Map<number, { name: string; arguments: string }>();

      for await (const chunk of this.requestStream(messages)) {
        const delta = chunk.choices?.[0]?.delta;

        const text = delta?.content === undefined || delta.content === null ? '' : String(delta.content);
        if (text) {
          content += text;
          yield { id, role: 'assistant', content: text };
        }

        for (const fragment of delta?.tool_calls ?? []) {
          const call = pendingToolCalls.get(fragment.index) ?? { name: '', arguments: '' };
          call.name += fragment.function?.name ?? '';
          call.arguments += fragment.function?.arguments ?? '';
          pendingToolCalls.set(fragment.index, call);
        }
      }

      const toolCalls: ModelToolCall[] = [...pendingToolCalls.values()].map(call => ({
        function: { name: call.name, arguments: JSON.parse(call.arguments || '{}') },
      }));

      if (content || toolCalls.length) {
        messages.push({ id, role: 'assistant', content, tool_calls: toolCalls });
      }

      if (toolCalls.length === 0) {
        break;
      }

      for (const toolCall of toolCalls) {
        console.debug('executing tool', toolCall.function.name);
        const data = await this.toolsService.execute(toolCall.function.name, toolCall.function.arguments);
        messages.push({
          id,
          role: 'tool',
          tool_name: toolCall.function.name,
          content: JSON.stringify(data),
        });

        yield {
          id,
          role: 'tool',
          tool_name: toolCall.function.name,
          content: '',
          tool_data: data,
        };
      }
    }
  }

  private async *requestStream(messages: ChatMessage[]): AsyncGenerator<StreamChunk> {
    const accountId = getCloudflareConfig().CLOUDFLARE_ACCOUNT_ID;
    const token = getCloudflareConfig().CLOUDFLARE_API_TOKEN;
    if (!accountId || !token) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set to use the cloudflare provider');
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: this.toApiMessages(messages),
        tools: this.toolsService.definitions,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Cloudflare request failed with status ${response.status}: ${await response.text()}`);
    }

    const decoder = new TextDecoder();
    let buffer = '';

    for await (const bytes of response.body) {
      buffer += decoder.decode(bytes, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const data = line.startsWith('data:') ? line.slice(5).trim() : '';
        if (data === '[DONE]') {
          return;
        }
        if (data) {
          yield JSON.parse(data) as StreamChunk;
        }
      }
    }
  }

  /**
   * Mistral models on Workers AI only accept tool call ids made of a-z, A-Z, 0-9
   * with a length of exactly 9 characters (e.g. `call00000`).
   */
  private toCallId(index: number): string {
    return `call${String(index).padStart(5, '0')}`;
  }

  /**
   * Maps the shared chat history to the OpenAI format, which requires tool calls
   * and tool results to be linked by an id.
   */
  private toApiMessages(messages: ChatMessage[]) {
    let nextCallId = 0;
    const pendingIds = new Map<string, string[]>();

    return messages.map(message => {
      if (message.role === 'assistant' && message.tool_calls?.length) {
        return {
          role: message.role,
          content: message.content,
          tool_calls: message.tool_calls.map(call => {
            const callId = this.toCallId(nextCallId++);
            pendingIds.set(call.function.name, [...(pendingIds.get(call.function.name) ?? []), callId]);
            return {
              id: callId,
              type: 'function',
              function: { name: call.function.name, arguments: JSON.stringify(call.function.arguments) },
            };
          }),
        };
      }

      if (message.role === 'tool') {
        return {
          role: message.role,
          tool_call_id: pendingIds.get(message.tool_name ?? '')?.shift(),
          content: message.content,
        };
      }

      return { role: message.role, content: message.content };
    });
  }
}
