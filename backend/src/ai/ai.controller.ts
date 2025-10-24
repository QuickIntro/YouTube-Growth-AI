import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService, private db: DatabaseService) {}

  @Post('generate-titles')
  @ApiOperation({ summary: 'Generate AI-powered video titles' })
  async generateTitles(@Request() req, @Body() body: any) {
    const titles = await this.aiService.generateTitles(body);
    
    await this.aiService.saveGeneration(
      req.user.id,
      'titles',
      body,
      { titles },
    );

    return { titles };
  }

  @Post('generate-description')
  @ApiOperation({ summary: 'Generate AI-powered video description' })
  async generateDescription(@Request() req, @Body() body: any) {
    const description = await this.aiService.generateDescription(body);
    
    await this.aiService.saveGeneration(
      req.user.id,
      'description',
      body,
      { description },
    );

    return { description };
  }

  @Post('generate-tags')
  @ApiOperation({ summary: 'Generate AI-powered video tags' })
  async generateTags(@Request() req, @Body() body: any) {
    const tags = await this.aiService.generateTags(body);
    
    await this.aiService.saveGeneration(
      req.user.id,
      'tags',
      body,
      { tags },
    );

    return { tags };
  }

  @Post('analyze-keyword')
  @ApiOperation({ summary: 'Analyze keyword for SEO insights' })
  async analyzeKeyword(@Request() req, @Body() body: { keyword: string; language?: 'bn' | 'en' }) {
    const analysis = await this.aiService.analyzeKeywords(body.keyword, body.language);
    
    await this.aiService.saveGeneration(
      req.user.id,
      'keyword-analysis',
      body,
      analysis,
    );

    return analysis;
  }

  @Post('analyze-title')
  @ApiOperation({ summary: 'Analyze a video title and store results' })
  async analyzeTitle(@Request() req, @Body() body: { title: string; language?: 'bn'|'en'; videoId?: string }) {
    return this.aiService.analyzeTitle(req.user.id, body);
  }

  @Post('analyze-description')
  @ApiOperation({ summary: 'Analyze a video description and store results' })
  async analyzeDescriptionText(@Request() req, @Body() body: { description: string; language?: 'bn'|'en'; videoId?: string }) {
    return this.aiService.analyzeDescription(req.user.id, body);
  }

  @Post('analyze-tags')
  @ApiOperation({ summary: 'Analyze a set of tags and store results' })
  async analyzeTags(@Request() req, @Body() body: { tags: string[]; language?: 'bn'|'en'; videoId?: string }) {
    return this.aiService.analyzeTags(req.user.id, body);
  }

  @Post('analyze-thumbnail')
  @ApiOperation({ summary: 'Analyze thumbnail heuristically and store results' })
  async analyzeThumbnail(@Request() req, @Body() body: { imageUrl?: string; videoId?: string }) {
    return this.aiService.analyzeThumbnail(req.user.id, body);
  }

  @Get('title-analyses')
  @ApiOperation({ summary: 'List past title analyses for the current user' })
  async listTitleAnalyses(@Request() req, @Query('videoId') videoId?: string, @Query('limit') limit = '50') {
    let q = this.db.getClient().from('title_analyses').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(parseInt(limit));
    if (videoId) q = q.eq('video_id', videoId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  @Get('description-analyses')
  @ApiOperation({ summary: 'List past description analyses for the current user' })
  async listDescriptionAnalyses(@Request() req, @Query('videoId') videoId?: string, @Query('limit') limit = '50') {
    let q = this.db.getClient().from('description_analyses').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(parseInt(limit));
    if (videoId) q = q.eq('video_id', videoId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  @Get('tag-analyses')
  @ApiOperation({ summary: 'List past tag analyses for the current user' })
  async listTagAnalyses(@Request() req, @Query('videoId') videoId?: string, @Query('limit') limit = '50') {
    let q = this.db.getClient().from('tag_analyses').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(parseInt(limit));
    if (videoId) q = q.eq('video_id', videoId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  @Get('thumbnail-analyses')
  @ApiOperation({ summary: 'List past thumbnail analyses for the current user' })
  async listThumbnailAnalyses(@Request() req, @Query('videoId') videoId?: string, @Query('limit') limit = '50') {
    let q = this.db.getClient().from('thumbnail_analyses').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(parseInt(limit));
    if (videoId) q = q.eq('video_id', videoId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
}
