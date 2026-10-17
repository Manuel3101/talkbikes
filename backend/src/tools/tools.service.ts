import { Injectable } from '@nestjs/common';
import { toolArgumentsSchema, validateInput, type ToolArguments, type ToolDefinition } from '@talkbikes/shared';

export type AppTool = {
  definition: ToolDefinition;
  handler: (arguments_: ToolArguments) => Promise<unknown>;
};

@Injectable()
export class ToolsService {
  readonly tools: AppTool[] = [
    {
      definition: {
        type: 'function',
        function: {
          name: 'get_bike_availability',
          description: 'Find available bikes for a location.',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The station, address, or place to check.',
              },
            },
            required: ['location'],
          },
        },
      },
      handler: this.getBikeAvailability.bind(this),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'get_station_information',
          description: 'Find information about a specific station.',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The station id, name or shortname.',
              },
            },
            required: ['location'],
          },
        },
      },
      handler: this.getStationInformation.bind(this),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'get_station_status',
          description: 'Get current status about a specific station.',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The station id',
              },
            },
            required: ['location'],
          },
        },
      },
      handler: this.getStationStatus.bind(this),
    },
  ];

  readonly definitions: ToolDefinition[] = this.tools.map(tool => tool.definition);

  async execute(name: string, args: unknown): Promise<unknown> {
    const tool = this.tools.find(currentTool => currentTool.definition.function.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return tool.handler(this.parseArguments(args));
  }

  private parseArguments(args: unknown): ToolArguments {
    if (typeof args === 'string') {
      const parsed: unknown = JSON.parse(args);
      return this.parseArguments(parsed);
    }

    const { success, output } = validateInput(toolArgumentsSchema, args);
    if (!success) {
      throw new Error(`Invalid tool arguments: ${output}`);
    }
    return output;
  }

  private async getBikeAvailability(args: ToolArguments): Promise<unknown> {
    const location = args.location;
    if (typeof location !== 'string' || location.trim() === '') {
      throw new Error('The location argument must be a non-empty string.');
    }

    const response = await fetch('https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/de/free_bike_status.json');
    const data = await response.json();

    return {
      location: location.trim(),
      message: data,
    };
  }

  private async getStationInformation(args: ToolArguments): Promise<unknown> {
    const location = args.location;
    if (typeof location !== 'string' || location.trim() === '') {
      throw new Error('The location argument must be a non-empty string.');
    }

    const response = await fetch('https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/de/station_information.json');
    const data = await response.json();

    return {
      location: location.trim(),
      message: data,
    };
  }

  private async getStationStatus(args: ToolArguments): Promise<unknown> {
    const location = args.location;
    if (typeof location !== 'string' || location.trim() === '') {
      throw new Error('The location argument must be a non-empty string.');
    }

    const response = await fetch('https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_kg/de/station_status.json');
    const data = await response.json();

    return {
      location: location.trim(),
      message: data,
    };
  }
}
