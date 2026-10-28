import { Injectable } from '@nestjs/common';
import {
  toolArgumentsSchema,
  validateInput,
  type MapData as ProcessedToolData,
  type ToolArguments,
  type ToolDefinition,
} from '@talkbikes/shared';
import { GbfsService } from '../gbfs/gbfs.service.ts';

export type AppTool = {
  definition: ToolDefinition;
  handler: (arguments_: ToolArguments) => Promise<ProcessedToolData>;
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

  async execute(name: string, args: unknown): Promise<ProcessedToolData> {
    const tool = this.tools.find(currentTool => currentTool.definition.function.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return tool.handler(this.parseArguments(args));
  }

  private parseArguments(args: unknown): ToolArguments {
    const value = typeof args === 'string' ? JSON.parse(args) : args;
    const { success, output } = validateInput(toolArgumentsSchema, value);
    if (!success) {
      throw new Error(`Invalid tool arguments: ${output}`);
    }
    return output;
  }

  private async getBikeAvailability(_args: ToolArguments): Promise<ProcessedToolData> {
    const result = await this.gbfsService.getBikeAvailability();
    if (!result) {
      return {
        success: false,
        error: 'Failed to retrieve bike availability data.',
      };
    }

    return {
      success: true,
      locations: result.data.bikes.flatMap(bike => {
        if (bike.lat === undefined || bike.lon === undefined) {
          return [];
        }

        return [
          {
            latitude: bike.lat,
            longitude: bike.lon,
            details: {
              kind: 'bike',
              vehicleType: bike.vehicle_type_id ?? 'unknown',
              ...(bike.station_id ? { stationId: bike.station_id } : {}),
            },
          },
        ];
      }),
    };
  }

  private async getStationInformation(_args: ToolArguments): Promise<ProcessedToolData> {
    const result = await this.gbfsService.getStationInformation();
    if (!result) {
      return {
        success: false,
        error: 'Failed to retrieve station information data.',
      };
    }

    return {
      success: true,
      locations: result.data.stations.flatMap(station => {
        return [
          {
            latitude: station.lat,
            longitude: station.lon,
            details: {
              kind: 'station',
              id: station.station_id,
              name: station.name,
              address: station.address,
            },
          },
        ];
      }),
    };
  }

  private async getStationStatus(_args: ToolArguments): Promise<ProcessedToolData> {
    const [statusResult, informationResult] = await Promise.all([
      this.gbfsService.getStationStatus(),
      this.gbfsService.getStationInformation(),
    ]);
    if (!statusResult || !informationResult) {
      return {
        success: false,
        error: 'Failed to retrieve station status data.',
      };
    }

    const stationsById = new Map(informationResult.data.stations.map(station => [station.station_id, station]));

    return {
      success: true,
      locations: statusResult.data.stations.flatMap(station => {
        const information = stationsById.get(station.station_id);
        if (!information) {
          return [];
        }

        return [
          {
            latitude: information.lat,
            longitude: information.lon,
            details: {
              kind: 'station',
              id: station.station_id,
              name: information.name,
              numBikesAvailable: station.num_bikes_available,
              numDocksAvailable: station.num_docks_available,
              isInstalled: station.is_installed,
              isRenting: station.is_renting,
              isReturning: station.is_returning,
              adress: information.address,
            },
          },
        ];
      }),
    };
  }
}
