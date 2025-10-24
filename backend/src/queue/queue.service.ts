import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  async scheduleAnalyticsUpdate(channelId: string, userId: string) {
    await this.analyticsQueue.add(
      'update-analytics',
      { channelId, userId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  async scheduleChannelSync(userId: string) {
    await this.analyticsQueue.add(
      'sync-channel',
      { userId },
      {
        repeat: {
          cron: '0 */6 * * *', // Every 6 hours
        },
      },
    );
  }
}
