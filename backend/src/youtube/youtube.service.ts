import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class YoutubeService {
  private youtube: any;
  private youtubeAnalytics: any;

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    const apiKey = this.configService.get<string>('YOUTUBE_API_KEY');
    this.youtube = google.youtube({ version: 'v3', auth: apiKey });
    this.youtubeAnalytics = google.youtubeAnalytics('v2');
  }

  async getChannelData(accessToken: string, refreshToken?: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const oauth2Client = clientId && clientSecret
      ? new google.auth.OAuth2(clientId, clientSecret)
      : new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
      const response = await youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        mine: true,
      });

      const channel = response.data.items?.[0];
      if (!channel) {
        throw new Error('No channel found');
      }

      return {
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl: channel.snippet.thumbnails.high.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        viewCount: parseInt(channel.statistics.viewCount),
        videoCount: parseInt(channel.statistics.videoCount),
        country: channel.snippet.country,
        publishedAt: channel.snippet.publishedAt,
      };
    } catch (error) {
      console.error('Error fetching channel data:', error);
      throw error;
    }
  }

  async getChannelVideos(accessToken: string, maxResults = 10, refreshToken?: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const oauth2Client = clientId && clientSecret
      ? new google.auth.OAuth2(clientId, clientSecret)
      : new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
      // Get channel's uploads playlist
      const channelResponse = await youtube.channels.list({
        part: ['contentDetails'],
        mine: true,
      });

      const uploadsPlaylistId =
        channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists
          ?.uploads;

      if (!uploadsPlaylistId) {
        return [];
      }

      // Get videos from uploads playlist
      const playlistResponse = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults,
      });

      const videoIds = playlistResponse.data.items.map(
        (item) => item.contentDetails.videoId,
      );

      // Get video statistics
      const videosResponse = await youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
      });

      return videosResponse.data.items.map((video) => ({
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high.url,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        duration: video.contentDetails.duration,
        tags: video.snippet.tags || [],
      }));
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  async getChannelAnalytics(accessToken: string, days = 30, refreshToken?: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const oauth2Client = clientId && clientSecret
      ? new google.auth.OAuth2(clientId, clientSecret)
      : new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    const youtubeAnalytics = google.youtubeAnalytics({
      version: 'v2',
      auth: oauth2Client,
    });

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        metrics:
          'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost',
        dimensions: 'day',
        sort: 'day',
      });

      const rows = response.data.rows || [];

      return {
        viewsData: rows.map((row) => ({
          date: row[0],
          value: parseInt(row[1]),
        })),
        watchTimeData: rows.map((row) => ({
          date: row[0],
          value: parseInt(row[2]),
        })),
        avgViewDuration: rows.reduce((sum, row) => sum + parseInt(row[3]), 0) / rows.length,
        avgViewPercentage: rows.reduce((sum, row) => sum + parseFloat(row[4]), 0) / rows.length,
        subscribersGained: rows.reduce((sum, row) => sum + parseInt(row[5]), 0),
        subscribersLost: rows.reduce((sum, row) => sum + parseInt(row[6]), 0),
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async searchVideos(query: string, maxResults = 10) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults,
        order: 'relevance',
      });

      return response.data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  }

  async getVideoDetails(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [videoId],
      });

      const video = response.data.items?.[0];
      if (!video) {
        throw new Error('Video not found');
      }

      return {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        duration: video.contentDetails.duration,
        tags: video.snippet.tags || [],
      };
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }

  async getCompetitorChannel(channelId: string) {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [channelId],
      });

      const channel = response.data.items?.[0];
      if (!channel) {
        throw new Error('Channel not found');
      }

      return {
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl: channel.snippet.thumbnails.high.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        viewCount: parseInt(channel.statistics.viewCount),
        videoCount: parseInt(channel.statistics.videoCount),
        publishedAt: channel.snippet.publishedAt,
      };
    } catch (error) {
      console.error('Error fetching competitor channel:', error);
      throw error;
    }
  }
}
