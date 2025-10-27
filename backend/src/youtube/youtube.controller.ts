import { Controller, Get, Post, Body, Query, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  // Video update (scheduling / metadata)
  @Post('video/update')
  @ApiOperation({ summary: 'Update video metadata or schedule publish (requires youtube scope)' })
  async updateVideo(@Request() req, @Body() body: any) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const { videoId, title, description, tags, categoryId, privacyStatus, publishAt } = body;
    if (!videoId) throw new BadRequestException('videoId is required');
    return this.youtubeService.updateVideo(
      user.access_token,
      user.refresh_token,
      { videoId, title, description, tags, categoryId, privacyStatus, publishAt }
    );
  }

  // Comments
  @Get('comments')
  @ApiOperation({ summary: 'List comments for a video (requires youtube scope for some data)' })
  async listComments(@Request() req, @Query('videoId') videoId: string, @Query('maxResults') maxResults = 20) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    if (!videoId) throw new BadRequestException('videoId is required');
    return this.youtubeService.listComments(user.access_token, videoId, maxResults, user.refresh_token);
  }

  @Post('comments/reply')
  @ApiOperation({ summary: 'Reply to a comment thread (requires youtube scope)' })
  async replyComment(@Request() req, @Body() body: any) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const { parentId, text } = body;
    if (!parentId || !text) throw new BadRequestException('parentId and text are required');
    return this.youtubeService.replyComment(user.access_token, parentId, text, user.refresh_token);
  }

  @Post('comments/moderate')
  @ApiOperation({ summary: 'Moderate a comment (requires youtube scope)' })
  async moderateComment(@Request() req, @Body() body: any) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const { commentId, action } = body;
    if (!commentId || !action) throw new BadRequestException('commentId and action are required');
    return this.youtubeService.moderateComment(user.access_token, commentId, action, user.refresh_token);
  }

  // Playlists
  @Get('playlists')
  @ApiOperation({ summary: 'List user playlists (requires youtube scope for private)' })
  async listPlaylists(@Request() req) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    return this.youtubeService.listPlaylists(user.access_token, user.refresh_token);
  }

  @Get('playlist-items')
  @ApiOperation({ summary: 'List items in a playlist' })
  async listPlaylistItems(@Request() req, @Query('playlistId') playlistId: string, @Query('maxResults') maxResults = 50) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    if (!playlistId) throw new BadRequestException('playlistId is required');
    return this.youtubeService.listPlaylistItems(user.access_token, playlistId, maxResults, user.refresh_token);
  }

  @Post('playlists/add')
  @ApiOperation({ summary: 'Add a video to a playlist (requires youtube scope)' })
  async addToPlaylist(@Request() req, @Body() body: any) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const { playlistId, videoId } = body;
    if (!playlistId || !videoId) throw new BadRequestException('playlistId and videoId are required');
    return this.youtubeService.addToPlaylist(user.access_token, playlistId, videoId, user.refresh_token);
  }

  @Post('playlists/remove')
  @ApiOperation({ summary: 'Remove a playlist item (requires youtube scope)' })
  async removeFromPlaylist(@Request() req, @Body() body: any) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const { playlistItemId } = body;
    if (!playlistItemId) throw new BadRequestException('playlistItemId is required');
    return this.youtubeService.removeFromPlaylist(user.access_token, playlistItemId, user.refresh_token);
  }

  @Post('playlists/reorder')
  @ApiOperation({ summary: 'Reorder a playlist item (requires youtube scope)' })
  async reorderPlaylistItem(@Request() req, @Body() body: any) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const { playlistItemId, position } = body;
    if (!playlistItemId || position === undefined) throw new BadRequestException('playlistItemId and position are required');
    return this.youtubeService.reorderPlaylistItem(user.access_token, playlistItemId, position, user.refresh_token);
  }

  // Uploads
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a video (requires youtube.upload or youtube scope)' })
  async uploadVideo(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    if (!file) throw new BadRequestException('file is required');
    const { title, description, tags, categoryId, privacyStatus, publishAt, madeForKids } = body;
    return this.youtubeService.uploadVideo(
      user.access_token,
      user.refresh_token,
      file,
      { title, description, tags, categoryId, privacyStatus, publishAt, madeForKids }
    );
  }

  @Post('thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Set a video thumbnail (requires youtube scope)' })
  async setThumbnail(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const user = await this.databaseService.getUserByEmail(req.user.email);
    const { videoId } = body;
    if (!file) throw new BadRequestException('file is required');
    if (!videoId) throw new BadRequestException('videoId is required');
    return this.youtubeService.setThumbnail(user.access_token, videoId, file, user.refresh_token);
  }
}
