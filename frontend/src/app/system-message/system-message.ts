import { Component, input } from '@angular/core';
import { ChatMessage, MapData } from '@talkbikes/shared';
import { BikeMap } from '../bike-map/bike-map';

@Component({
  imports: [BikeMap],
  selector: 'app-system-message',
  templateUrl: './system-message.html',
})
export class SystemMessage {
  public readonly message = input.required<ChatMessage>();
  public readonly mapData = input<MapData[]>([]);
}
