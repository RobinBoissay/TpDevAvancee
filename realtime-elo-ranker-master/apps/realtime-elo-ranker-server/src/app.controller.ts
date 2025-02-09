import { Controller, Get, Post, Body, Sse, MessageEvent } from '@nestjs/common';
import { Player } from './player.entity';
import { AppService } from './app.service';
import { Observable, fromEvent, map, mergeMap } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly eventEmitter: EventEmitter2) {}

  @Get('/api/ranking')
  async getRanking(): Promise<Player[]> {
    return this.appService.getRanking();
  }

  @Post('/api/player')
  async createPlayer(@Body('id') id: string): Promise<Player> {
    return this.appService.createPlayer(id);
  }

  @Post('/api/match')
  async handleMatchResult(
    @Body('winner') winnerId: string,
    @Body('loser') loserId: string,
    @Body('draw') draw: boolean,
  ) {
    return this.appService.handleMatchResult(winnerId, loserId, draw);
  }

  @Sse('/api/ranking/events')
  subscribeRankingUpdates(): Observable<MessageEvent> {
    return fromEvent<Player[]>(this.eventEmitter, 'ranking.updated').pipe(
      mergeMap((players) => players.map(user => ({
        data: {
          type: 'RankingUpdate',
          player: {
            id: user.id,
            rank: user.rank
          }
        }
      })))
    );
  }
  
}
