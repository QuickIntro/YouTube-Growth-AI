import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { YoutubeService } from '../youtube/youtube.service';

@Processor('analytics')
export class AnalyticsProcessor {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(
    private databaseService: DatabaseService,
    private youtubeService: YoutubeService,
  ) {}

  @Process('update-analytics')
  async handleAnalyticsUpdate(job: Job) {
    const { channelId, userId } = job.data;
    this.logger.log(`Processing analytics update for channel: ${channelId}`);

    try {
      const user = await this.databaseService
        .getClient()
        .from('users')
        .select('access_token')
        .eq('id', userId)
        .single();

      if (!user.data) {
        throw new Error('User not found');
      }

      const analytics = await this.youtubeService.getChannelAnalytics(
        user.data.access_token,
        30,
      );

      await this.databaseService.saveAnalytics({
        channel_id: channelId,
        date: new Date().toISOString().split('T')[0],
        views: analytics.viewsData[analytics.viewsData.length - 1]?.value || 0,
        watch_time_minutes:
          analytics.watchTimeData[analytics.watchTimeData.length - 1]?.value || 0,
        average_view_duration: analytics.avgViewDuration,
      });

      this.logger.log(`Analytics updated successfully for channel: ${channelId}`);
    } catch (error) {
      this.logger.error(`Error updating analytics: ${error.message}`);
      throw error;
    }
  }

  @Process('sync-channel')
  async handleChannelSync(job: Job) {
    const { userId } = job.data;
    this.logger.log(`Syncing channel data for user: ${userId}`);

    try {
      const user = await this.databaseService
        .getClient()
        .from('users')
        .select('access_token')
        .eq('id', userId)
        .single();

      if (!user.data) {
        throw new Error('User not found');
      }

      const channelData = await this.youtubeService.getChannelData(
        user.data.access_token,
      );

      await this.databaseService.saveChannelData({
        user_id: userId,
        ...channelData,
      });

      this.logger.log(`Channel synced successfully for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error syncing channel: ${error.message}`);
      throw error;
    }
  }
}
