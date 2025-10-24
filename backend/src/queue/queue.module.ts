import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { AnalyticsProcessor } from './analytics.processor';
import { YoutubeModule } from '../youtube/youtube.module';

@Module({
  imports: [
    YoutubeModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  providers: [QueueService, AnalyticsProcessor],
  exports: [QueueService],
})
export class QueueModule {}
