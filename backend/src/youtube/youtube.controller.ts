import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { YoutubeService } from './youtube.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@ApiTags('YouTube')
@Controller('youtube')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class YoutubeController {
  constructor(
    private youtubeService: YoutubeService,
    private databaseService: DatabaseService,
  ) {}

  @Get('channel')
  @ApiOperation({ summary: 'Get authenticated user channel data' })
  async getChannel(@Request() req) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const channelData = await this.youtubeService.getChannelData(
      user.access_token,
      user.refresh_token,
    );

    // Save/update channel data
    await this.databaseService.saveChannelData({
      user_id: user.id,
      ...channelData,
    });

    return channelData;
  }

  @Get('videos')
  @ApiOperation({ summary: 'Get channel videos' })
  async getVideos(@Request() req, @Query('maxResults') maxResults = 10) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    return this.youtubeService.getChannelVideos(
      user.access_token,
      maxResults,
      user.refresh_token,
    );
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get channel analytics' })
  async getAnalytics(@Request() req, @Query('days') days = 30) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const analytics = await this.youtubeService.getChannelAnalytics(
      user.access_token,
      days,
      user.refresh_token,
    );

    // Save analytics data
    const channel = await this.databaseService.getChannelByUserId(user.id);
    if (channel) {
      await this.databaseService.saveAnalytics({
        channel_id: channel.channel_id,
        date: new Date().toISOString().split('T')[0],
        views: analytics.viewsData[analytics.viewsData.length - 1]?.value || 0,
        watch_time_minutes: analytics.watchTimeData[analytics.watchTimeData.length - 1]?.value || 0,
        average_view_duration: analytics.avgViewDuration,
        ctr: 0, // Calculate from actual data
        engagement_rate: 0, // Calculate from actual data
      });
    }

    return analytics;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search YouTube videos' })
  async searchVideos(
    @Query('q') query: string,
    @Query('maxResults') maxResults = 10,
  ) {
    return this.youtubeService.searchVideos(query, maxResults);
  }

  @Get('video')
  @ApiOperation({ summary: 'Get video details' })
  async getVideoDetails(@Query('videoId') videoId: string) {
    return this.youtubeService.getVideoDetails(videoId);
  }

  @Get('competitor')
  @ApiOperation({ summary: 'Get competitor channel data' })
  async getCompetitorChannel(@Query('channelId') channelId: string) {
    return this.youtubeService.getCompetitorChannel(channelId);
  }
}
