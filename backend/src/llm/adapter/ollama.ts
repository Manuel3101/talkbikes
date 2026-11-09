import { Injectable } from '@nestjs/common';
import type { ChatMessage, ModelToolCall } from '@talkbikes/shared';
import ollama from 'ollama';
import { ToolsService } from '../../tools/tools.service.ts';

import type { Input, LlmProvider } from '../../types/llmProvider.ts';

@Injectable()
export class OllamaAdapter implements LlmProvider {
  constructor(private readonly toolsService: ToolsService) {}

  async *streamChat({ id, messages }: Input): AsyncIterable<ChatMessage> {
    while (true) {
      const stream = await ollama.chat({
        model: 'gemma4:e2b',
        messages,
        tools: this.toolsService.definitions,
        stream: true,
      });

      let content = '';
      let thinking = '';
      const toolCalls: ModelToolCall[] = [];

      for await (const chunk of stream) {
        if (chunk.message.thinking) {
          thinking += chunk.message.thinking;
        }
        if (chunk.message.content) {
          content += chunk.message.content;
          yield { id, role: 'assistant', content: chunk.message.content };
        }

        if (chunk.message.tool_calls?.length) {
          console.debug('pushing toolcalls: ', ...chunk.message.tool_calls);
          toolCalls.push(...chunk.message.tool_calls);
        }
      }

      if (content || thinking || toolCalls.length) {
        messages.push({ id, role: 'assistant', content, thinking, tool_calls: toolCalls });
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
}
