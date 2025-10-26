import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class ThumbnailService {
  constructor(
    private databaseService: DatabaseService,
    private aiService: AiService,
    private configService: ConfigService,
  ) {}

  async analyzeThumbnail(file: Express.Multer.File, userId: string) {
    const provider = (this.configService.get<string>('THUMBNAIL_PROVIDER') || 'gemini').toLowerCase();
    console.log(`[Thumbnail] Provider selected: ${provider}`);

    if (provider === 'render') {
      const baseUrl = (this.configService.get<string>('RENDER_THUMBNAIL_SERVICE_URL') || '').replace(/\/+$/, '');
      const apiKey = this.configService.get<string>('RENDER_API_KEY') || '';
      console.log(`[Thumbnail] Render URL: ${baseUrl || '(missing)'}\n`);
      if (!baseUrl) throw new HttpException('Thumbnail service unavailable: RENDER_THUMBNAIL_SERVICE_URL is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      if (!apiKey) throw new HttpException('Thumbnail service unavailable: RENDER_API_KEY is not configured', HttpStatus.SERVICE_UNAVAILABLE);

      const form = new FormData();
      form.append('file', file.buffer, {
        filename: 'thumbnail.jpg',
        contentType: file.mimetype || 'image/jpeg',
      });

      const headers = {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
      };

      const target = `${baseUrl}/analyze`;
      console.log(`[Thumbnail] Posting to render analyzer: ${target}`);
      const { data: result } = await axios.post(target, form, { headers });

      await this.databaseService.getClient().from('thumbnail_analyses').insert({
        user_id: userId,
        video_id: null,
        overall_score: (result?.overall_score ?? result?.score) ?? null,
        details: result,
        created_at: new Date().toISOString(),
      });
      return result;
    }

    const result = await this.aiService.analyzeThumbnailFromBuffer(
      userId,
      file.buffer,
      file.mimetype || 'image/jpeg',
    );
    return result;
  }

  async getThumbnailHistory(userId: string, limit = 20) {
    const { data, error } = await this.databaseService
      .getClient()
      .from('thumbnail_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
