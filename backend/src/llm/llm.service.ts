import { Injectable } from '@nestjs/common';
import type { ChatMessage, ModelToolCall } from '@talkbikes/shared';
import ollama from 'ollama';
import { ToolsService } from '../tools/tools.service.ts';

@Injectable()
export class LlmService {
  constructor(private readonly toolsService: ToolsService) {}

  async *streamChat(question: string): AsyncGenerator<ChatMessage> {
    const id = crypto.randomUUID();
    // TODO: need to send entire chat history instead of just the last user question
    const messages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: `You are Talkbikes, a mobility assistant. Respond in the user's language.

        Use a tool when the user asks about bikes, stations, availability, or mobility services.
        After receiving a tool result, answer the user's original question using that result.
        Do not return raw GBFS data.
        If the tool result does not contain enough information, say so clearly.
        Do not describe the tool call to the user.`,
      },
      { id, role: 'user', content: question },
    ];

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
        console.debug('amout of data send to llm: ', JSON.stringify(data).length);
        messages.push({
          id,
          role: 'tool',
          tool_name: toolCall.function.name,
          content: JSON.stringify(data),
        });
      }
    }
  }
}
