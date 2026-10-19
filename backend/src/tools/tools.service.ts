import { Injectable } from '@nestjs/common';
import {
  toolArgumentsSchema,
  validateInput,
  type BikeAvailabilityTool,
  type StationInformationTool,
  type StationStatusTool,
  type ToolArguments,
  type ToolDefinition,
} from '@talkbikes/shared';
import { GbfsService } from '../gbfs/gbfs.service.ts';

export type AppTool = {
  definition: ToolDefinition;
  handler: (arguments_: ToolArguments) => Promise<unknown>;
};

@Injectable()
export class ToolsService {
  readonly tools: AppTool[] = [];
  readonly definitions: ToolDefinition[] = [];

  constructor(private readonly gbfsService: GbfsService) {
    this.tools = [
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
        handler: args => this.getBikeAvailability(args),
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
        handler: args => this.getStationInformation(args),
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
        handler: args => this.getStationStatus(args),
      },
    ];
    this.definitions = this.tools.map(tool => tool.definition);
  }

  // TODO: should be properly typed
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

  private async getBikeAvailability(args: ToolArguments): Promise<BikeAvailabilityTool> {
    const location = args.location;
    if (typeof location !== 'string' || location.trim() === '') {
      throw new Error('The location argument must be a non-empty string.');
    }

    const result = await this.gbfsService.getBikeAvailability();
    if (!result) {
      return {
        success: false,
        error: 'Failed to retrieve bike availability data.',
      };
    }

    const { data } = result;
    const response: BikeAvailabilityTool = { success: true, availableBikes: [] };

    for (const bike of data.bikes) {
      response.availableBikes.push({
        stationId: bike.station_id,
        type: bike.vehicle_type_id ?? 'unknown',
        latitude: bike.lat,
        longitude: bike.lon,
      });
    }

    return response;
  }

  private async getStationInformation(args: ToolArguments): Promise<StationInformationTool> {
    const location = args.location;
    if (typeof location !== 'string' || location.trim() === '') {
      throw new Error('The location argument must be a non-empty string.');
    }

    const result = await this.gbfsService.getStationInformation();
    if (!result) {
      return {
        success: false,
        error: 'Failed to retrieve station information data.',
      };
    }

    const { data } = result;
    const response: StationInformationTool = { success: true, stations: [] };

    for (const station of data.stations) {
      response.stations.push({
        id: station.station_id,
        latitude: station.lat,
        longitude: station.lon,
        name: station.name,
        address: station.address,
      });
    }

    return response;
  }

  private async getStationStatus(args: ToolArguments): Promise<StationStatusTool> {
    const location = args.location;
    if (typeof location !== 'string' || location.trim() === '') {
      throw new Error('The location argument must be a non-empty string.');
    }

    const result = await this.gbfsService.getStationStatus();
    if (!result) {
      return {
        success: false,
        error: 'Failed to retrieve station status data.',
      };
    }

    const { data } = result;
    const response: StationStatusTool = { success: true, stations: [] };

    for (const station of data.stations) {
      response.stations.push({
        id: station.station_id,
        isInstalled: station.is_installed,
        isRenting: station.is_renting,
        isReturning: station.is_returning,
        numBikesAvailable: station.num_bikes_available,
        numDocksAvailable: station.num_docks_available,
      });
    }

    return response;
  }
}
