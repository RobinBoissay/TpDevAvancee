import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity'; 

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db',
      entities: [Player], 
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([Player]), 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
