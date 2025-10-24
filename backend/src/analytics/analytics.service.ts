import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private databaseService: DatabaseService) {}

  async getChannelAnalytics(channelId: string, days = 30) {
    const analytics = await this.databaseService.getAnalyticsByChannelId(
      channelId,
      days,
    );

    if (!analytics || analytics.length === 0) {
      return {
        viewsData: [],
        engagementData: [],
        avgCTR: '0%',
        watchTime: '0h',
        totalViews: 0,
        totalEngagement: 0,
      };
    }

    const viewsData = analytics.map((row) => ({
      date: row.date,
      value: row.views,
    }));

    const engagementData = analytics.map((row) => ({
      date: row.date,
      value: row.engagement_rate,
    }));

    const avgCTR =
      analytics.reduce((sum, row) => sum + (row.ctr || 0), 0) /
      analytics.length;

    const totalWatchTime = analytics.reduce(
      (sum, row) => sum + (row.watch_time_minutes || 0),
      0,
    );

    const totalViews = analytics.reduce((sum, row) => sum + (row.views || 0), 0);

    const avgEngagement =
      analytics.reduce((sum, row) => sum + (row.engagement_rate || 0), 0) /
      analytics.length;

    return {
      viewsData,
      engagementData,
      avgCTR: `${avgCTR.toFixed(1)}%`,
      watchTime: `${Math.round(totalWatchTime / 60)}h`,
      totalViews,
      totalEngagement: avgEngagement.toFixed(1),
    };
  }

  async getVideoPerformance(channelId: string, limit = 10) {
    const { data, error } = await this.databaseService
      .getClient()
      .from('videos')
      .select('*')
      .eq('channel_id', channelId)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getGrowthTrends(channelId: string, days = 30) {
    const analytics = await this.databaseService.getAnalyticsByChannelId(
      channelId,
      days,
    );

    if (!analytics || analytics.length < 2) {
      return {
        viewsGrowth: 0,
        subscribersGrowth: 0,
        engagementGrowth: 0,
      };
    }

    const recent = analytics.slice(0, Math.floor(analytics.length / 2));
    const older = analytics.slice(Math.floor(analytics.length / 2));

    const recentAvgViews =
      recent.reduce((sum, row) => sum + row.views, 0) / recent.length;
    const olderAvgViews =
      older.reduce((sum, row) => sum + row.views, 0) / older.length;

    const viewsGrowth =
      ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100;

    const recentAvgSubs =
      recent.reduce((sum, row) => sum + (row.subscribers_gained || 0), 0) /
      recent.length;
    const olderAvgSubs =
      older.reduce((sum, row) => sum + (row.subscribers_gained || 0), 0) /
      older.length;

    const subscribersGrowth =
      olderAvgSubs > 0 ? ((recentAvgSubs - olderAvgSubs) / olderAvgSubs) * 100 : 0;

    const recentAvgEngagement =
      recent.reduce((sum, row) => sum + (row.engagement_rate || 0), 0) /
      recent.length;
    const olderAvgEngagement =
      older.reduce((sum, row) => sum + (row.engagement_rate || 0), 0) /
      older.length;

    const engagementGrowth =
      olderAvgEngagement > 0
        ? ((recentAvgEngagement - olderAvgEngagement) / olderAvgEngagement) * 100
        : 0;

    return {
      viewsGrowth: viewsGrowth.toFixed(1),
      subscribersGrowth: subscribersGrowth.toFixed(1),
      engagementGrowth: engagementGrowth.toFixed(1),
    };
  }
}
