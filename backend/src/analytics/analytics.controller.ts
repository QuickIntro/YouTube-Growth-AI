import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
    private databaseService: DatabaseService,
  ) {}

  @Get('channel')
  @ApiOperation({ summary: 'Get channel analytics' })
  async getChannelAnalytics(@Request() req, @Query('days') days = 30) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const channel = await this.databaseService.getChannelByUserId(user.id);

    if (!channel) {
      return {
        viewsData: [],
        engagementData: [],
        avgCTR: '0%',
        watchTime: '0h',
      };
    }

    return this.analyticsService.getChannelAnalytics(channel.channel_id, days);
  }

  @Get('videos')
  @ApiOperation({ summary: 'Get top performing videos' })
  async getVideoPerformance(@Request() req, @Query('limit') limit = 10) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const channel = await this.databaseService.getChannelByUserId(user.id);

    if (!channel) {
      return [];
    }

    return this.analyticsService.getVideoPerformance(channel.channel_id, limit);
  }

  @Get('growth')
  @ApiOperation({ summary: 'Get growth trends' })
  async getGrowthTrends(@Request() req, @Query('days') days = 30) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const channel = await this.databaseService.getChannelByUserId(user.id);

    if (!channel) {
      return {
        viewsGrowth: 0,
        subscribersGrowth: 0,
        engagementGrowth: 0,
      };
    }

    return this.analyticsService.getGrowthTrends(channel.channel_id, days);
  }
}
