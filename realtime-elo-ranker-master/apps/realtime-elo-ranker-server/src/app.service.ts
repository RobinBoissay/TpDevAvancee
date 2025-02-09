import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, BehaviorSubject } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';

@Injectable()
export class AppService {
  private constant = 32;
  private rankMAJ = new BehaviorSubject<Player[]>([]);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Player) private playerRepository: Repository<Player>,
  ) {}

  async createPlayer(id: string): Promise<Player> {
    const existingPlayer = await this.playerRepository.findOne({ where: { id } });

    if (existingPlayer) {
      throw new Error('Le joueur existe déjà, veuillez en choisir un autre');
    }

    const newPlayer = this.playerRepository.create({ id, rank: 1200 });
    await this.playerRepository.save(newPlayer);
    this.updateRanking();
    return newPlayer;
  }

  private async updateRanking() {
    const players = await this.getRanking();
    this.rankMAJ.next(players); 
    this.eventEmitter.emit('ranking.updated', players); 
  }

  async handleMatchResult(wId: string, lId: string, tie: boolean) {
    const winner = await this.playerRepository.findOne({ where: { id: wId } });
    const loser = await this.playerRepository.findOne({ where: { id: lId } });

    if (!winner || !loser) {
      return null;
    }

    const expectedWinner = 1 / (1 + Math.pow(10, (loser.rank - winner.rank) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winner.rank - loser.rank) / 400));


    const scoreWinner = tie ? 0.5 : 1; 
    const scoreLoser = tie ? 0.5 : 0;  

    const newWinnerRank = winner.rank + this.constant * (scoreWinner - expectedWinner);
    const newLoserRank = loser.rank + this.constant * (scoreLoser - expectedLoser);

    winner.rank = Math.round(newWinnerRank); 
    loser.rank = Math.round(newLoserRank);   

    await this.playerRepository.save([winner, loser]);

    this.updateRanking();
    return { winner, loser };
  }
  
  subscribeRankingUpdates(): Observable<Player[]> {
    return this.rankMAJ.asObservable();
  }

  async getRanking(): Promise<Player[]> {
    return this.playerRepository.find({ order: { rank: 'DESC' } });
  }
}
