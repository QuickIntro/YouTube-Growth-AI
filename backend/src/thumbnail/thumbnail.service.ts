import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ThumbnailService {
  constructor(
    private databaseService: DatabaseService,
    private aiService: AiService,
    private configService: ConfigService,
  ) {}

  async analyzeThumbnail(file: Express.Multer.File, userId: string) {
    const provider = (this.configService.get<string>('THUMBNAIL_PROVIDER') || 'gemini').toLowerCase();

    if (provider === 'render') {
      const baseUrl = (this.configService.get<string>('RENDER_THUMBNAIL_SERVICE_URL') || '').replace(/\/+$/, '');
      const apiKey = this.configService.get<string>('RENDER_API_KEY') || '';
      if (!baseUrl) throw new Error('RENDER_THUMBNAIL_SERVICE_URL is not configured');
      if (!apiKey) throw new Error('RENDER_API_KEY is not configured');

      const blob = new Blob([file.buffer], { type: file.mimetype || 'image/jpeg' });
      const form = new FormData();
      form.append('file', blob, 'thumbnail.jpg');

      const resp = await fetch(`${baseUrl}/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form as any,
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Render thumbnail service error: ${resp.status} ${text}`);
      }
      const result = await resp.json();

      await this.databaseService.getClient().from('thumbnail_analyses').insert({
        user_id: userId,
        video_id: null,
        overall_score: result?.score ?? null,
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
