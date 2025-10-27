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

  // ============ WRITE/ADMIN METHODS ============

  private oauthClient(accessToken: string, refreshToken?: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const oauth2Client = clientId && clientSecret
      ? new google.auth.OAuth2(clientId, clientSecret)
      : new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    return oauth2Client;
  }

  async updateVideo(
    accessToken: string,
    refreshToken: string | undefined,
    input: {
      videoId: string;
      title?: string;
      description?: string;
      tags?: string[];
      categoryId?: string;
      privacyStatus?: 'private' | 'public' | 'unlisted';
      publishAt?: string; // RFC3339
    },
  ) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });

    const { videoId, title, description, tags, categoryId, privacyStatus, publishAt } = input;
    try {
      const request: any = {
        part: ['snippet', 'status'],
        requestBody: {
          id: videoId,
          snippet: {},
          status: {},
        },
      };
      if (title !== undefined) (request.requestBody.snippet as any).title = title;
      if (description !== undefined) (request.requestBody.snippet as any).description = description;
      if (tags !== undefined) (request.requestBody.snippet as any).tags = tags;
      if (categoryId !== undefined) (request.requestBody.snippet as any).categoryId = categoryId;
      if (privacyStatus !== undefined) (request.requestBody.status as any).privacyStatus = privacyStatus;
      if (publishAt) {
        (request.requestBody.status as any).publishAt = publishAt;
        // To schedule, video must be private until publishAt
        if (!(request.requestBody.status as any).privacyStatus) {
          (request.requestBody.status as any).privacyStatus = 'private';
        }
      }

      const res = await yt.videos.update(request);

      // Log to DB
      try {
        await db.from('youtube_video_updates').insert({
          user_id: null, // filled by trigger or add via controller if needed
          video_id: videoId,
          title,
          description,
          tags,
          category_id: categoryId,
          privacy_status: privacyStatus,
          publish_at: publishAt ? new Date(publishAt).toISOString() : null,
          applied: true,
          applied_at: new Date().toISOString(),
        });
      } catch {}

      return res.data;
    } catch (error) {
      console.error('Error updating video:', error);
      // Log failure
      try {
        await db.from('youtube_video_updates').insert({
          user_id: null,
          video_id: videoId,
          title,
          description,
          tags,
          category_id: categoryId,
          privacy_status: privacyStatus,
          publish_at: publishAt ? new Date(publishAt).toISOString() : null,
          applied: false,
          error_message: String((error as any)?.message || error),
        });
      } catch {}
      throw error;
    }
  }

  async listComments(accessToken: string, videoId: string, maxResults = 20, refreshToken?: string) {
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    const res = await yt.commentThreads.list({
      part: ['snippet', 'replies'],
      videoId,
      maxResults,
      textFormat: 'plainText',
      order: 'time',
    });
    return res.data;
  }

  async replyComment(accessToken: string, parentId: string, text: string, refreshToken?: string) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    try {
      const res = await yt.comments.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            parentId,
            textOriginal: text,
          },
        },
      });
      try {
        await db.from('youtube_comment_actions').insert({ action: 'reply', thread_id: parentId, payload: { text }, success: true });
      } catch {}
      return res.data;
    } catch (error) {
      try { await db.from('youtube_comment_actions').insert({ action: 'reply', thread_id: parentId, payload: { text }, success: false, error_message: String((error as any)?.message || error) }); } catch {}
      throw error;
    }
  }

  async moderateComment(accessToken: string, commentId: string, action: string, refreshToken?: string) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    try {
      // Map action to moderationStatus
      let moderationStatus: 'published' | 'heldForReview' | 'rejected' | undefined;
      let banAuthor = false;
      if (action === 'approve') moderationStatus = 'published';
      else if (action === 'reject') moderationStatus = 'rejected';
      else if (action === 'hold' || action === 'heldForReview') moderationStatus = 'heldForReview';
      else if (action === 'spam') { moderationStatus = 'rejected'; banAuthor = true; }

      if (moderationStatus) {
        await yt.comments.setModerationStatus({ id: [commentId], moderationStatus, banAuthor });
      } else if (action === 'hide' || action === 'unhide') {
        await yt.comments.update({
          part: ['snippet'],
          requestBody: { id: commentId, snippet: { moderationStatus: action === 'hide' ? 'rejected' : 'published' } as any },
        });
      } else {
        throw new Error('Unsupported moderation action');
      }
      try { await db.from('youtube_comment_actions').insert({ action, comment_id: commentId, success: true }); } catch {}
      return { success: true };
    } catch (error) {
      try { await db.from('youtube_comment_actions').insert({ action, comment_id: commentId, success: false, error_message: String((error as any)?.message || error) }); } catch {}
      throw error;
    }
  }

  async listPlaylists(accessToken: string, refreshToken?: string) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    const res = await yt.playlists.list({ part: ['snippet', 'contentDetails', 'status'], mine: true, maxResults: 50 });
    const items = res.data.items || [];
    // cache
    try {
      for (const p of items) {
        await db.from('youtube_playlists').upsert({
          playlist_id: p.id,
          title: p.snippet?.title,
          description: p.snippet?.description,
          item_count: p.contentDetails?.itemCount,
          privacy_status: p.status?.privacyStatus,
          raw: p as any,
        }, { onConflict: 'playlist_id' } as any);
      }
    } catch {}
    return items;
  }

  async listPlaylistItems(accessToken: string, playlistId: string, maxResults = 50, refreshToken?: string) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    const res = await yt.playlistItems.list({ part: ['snippet', 'contentDetails'], playlistId, maxResults });
    const items = res.data.items || [];
    // cache
    try {
      for (const it of items) {
        await db.from('youtube_playlist_items').upsert({
          playlist_id: playlistId,
          playlist_item_id: it.id,
          video_id: it.contentDetails?.videoId,
          position: it.snippet?.position,
          title: it.snippet?.title,
          raw: it as any,
        }, { onConflict: 'playlist_item_id' } as any);
      }
    } catch {}
    return items;
  }

  async addToPlaylist(accessToken: string, playlistId: string, videoId: string, refreshToken?: string) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    try {
      const res = await yt.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
          snippet: { playlistId, resourceId: { kind: 'youtube#video', videoId } },
        },
      });
      try { await db.from('youtube_playlist_actions').insert({ action: 'add', playlist_id: playlistId, video_id: videoId, success: true, payload: { playlistItemId: res.data.id } }); } catch {}
      return res.data;
    } catch (error) {
      try { await db.from('youtube_playlist_actions').insert({ action: 'add', playlist_id: playlistId, video_id: videoId, success: false, error_message: String((error as any)?.message || error) }); } catch {}
      throw error;
    }
  }

  async removeFromPlaylist(accessToken: string, playlistItemId: string, refreshToken?: string) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    try {
      await yt.playlistItems.delete({ id: playlistItemId });
      try { await db.from('youtube_playlist_actions').insert({ action: 'remove', playlist_item_id: playlistItemId, success: true }); } catch {}
      return { success: true };
    } catch (error) {
      try { await db.from('youtube_playlist_actions').insert({ action: 'remove', playlist_item_id: playlistItemId, success: false, error_message: String((error as any)?.message || error) }); } catch {}
      throw error;
    }
  }

  async reorderPlaylistItem(accessToken: string, playlistItemId: string, position: number, refreshToken?: string) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    try {
      // Need to fetch existing item to get playlistId and snippet
      const current = await yt.playlistItems.list({ part: ['snippet'], id: [playlistItemId] });
      const item = current.data.items?.[0];
      if (!item) throw new Error('Playlist item not found');
      const playlistId = item.snippet?.playlistId as string;
      const res = await yt.playlistItems.update({
        part: ['snippet'],
        requestBody: {
          id: playlistItemId,
          snippet: {
            playlistId,
            resourceId: item.snippet?.resourceId,
            position,
          } as any,
        },
      });
      try { await db.from('youtube_playlist_actions').insert({ action: 'reorder', playlist_item_id: playlistItemId, position, success: true }); } catch {}
      return res.data;
    } catch (error) {
      try { await db.from('youtube_playlist_actions').insert({ action: 'reorder', playlist_item_id: playlistItemId, position, success: false, error_message: String((error as any)?.message || error) }); } catch {}
      throw error;
    }
  }

  async uploadVideo(
    accessToken: string,
    refreshToken: string | undefined,
    file: Express.Multer.File,
    input: {
      title?: string;
      description?: string;
      tags?: string[];
      categoryId?: string;
      privacyStatus?: 'private' | 'public' | 'unlisted';
      publishAt?: string;
      madeForKids?: boolean;
    },
  ) {
    const db = this.databaseService.getClient();
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });

    const { title, description, tags, categoryId, privacyStatus, publishAt, madeForKids } = input;
    // create upload job row
    let jobId: string | undefined;
    try {
      const ins = await db.from('youtube_uploads').insert({
        status: 'uploading', title, description, tags, category_id: categoryId, privacy_status: privacyStatus, publish_at: publishAt ? new Date(publishAt).toISOString() : null, made_for_kids: madeForKids,
      }).select('id').single();
      jobId = ins.data?.id;
    } catch {}

    try {
      const res = await yt.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: { title, description, tags, categoryId },
          status: {
            privacyStatus: publishAt ? 'private' : (privacyStatus || 'private'),
            publishAt: publishAt,
            selfDeclaredMadeForKids: madeForKids,
          } as any,
        },
        media: { body: Buffer.from(file.buffer) },
      } as any);

      const videoId = res.data.id;
      try { await db.from('youtube_uploads').update({ status: 'completed', video_id: videoId }).eq('id', jobId as any); } catch {}
      return res.data;
    } catch (error) {
      try { await db.from('youtube_uploads').update({ status: 'failed', error_message: String((error as any)?.message || error) }).eq('id', jobId as any); } catch {}
      throw error;
    }
  }

  async setThumbnail(accessToken: string, videoId: string, file: Express.Multer.File, refreshToken?: string) {
    const oauth2Client = this.oauthClient(accessToken, refreshToken);
    const yt = google.youtube({ version: 'v3', auth: oauth2Client });
    const res = await yt.thumbnails.set({ videoId, media: { body: Buffer.from(file.buffer) } as any } as any);
    return res.data;
  }
}
