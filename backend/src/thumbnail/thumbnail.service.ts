import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ThumbnailService {
  constructor(
    private databaseService: DatabaseService,
    private aiService: AiService,
  ) {}

  async analyzeThumbnail(file: Express.Multer.File, userId: string) {
    // Use Gemini Vision via AiService for uploaded files
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
