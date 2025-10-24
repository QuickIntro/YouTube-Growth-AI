import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Resolve model name: honor explicit env, else use a safe default (2.5-pro).
    const envModel = this.configService.get<string>('GEMINI_MODEL');
    let modelName = (envModel ?? 'gemini-2.5-pro').trim();
    // Sanitize: convert spaces to hyphens (e.g., 'Gemini 2.5 Pro' -> 'Gemini-2.5-Pro')
    modelName = modelName.replace(/\s+/g, '-');

    // Debug env inspection (temporary)
    console.log('[AI] Env GEMINI_MODEL raw:', process.env.GEMINI_MODEL);
    console.log('[AI] Env GEMINI_API_KEY prefix:', process.env.GEMINI_API_KEY?.slice(0, 6));

    // Normalize only one legacy alias; otherwise keep env selection as-is
    const lower = modelName.toLowerCase();
    if (lower === 'gemini-pro') {
      modelName = 'gemini-2.5-pro';
    }

    // Otherwise, keep the env-provided value as-is (e.g., 'gemini-2.5-pro')
    console.log(`[AI] Using Gemini model: ${modelName}`);

    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  private async generateWithRetry(prompt: string): Promise<string> {
    const maxAttempts = 3;
    let lastErr: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (err: any) {
        lastErr = err;
        const msg = String(err?.message || '');
        const is429 = msg.includes('429') || /Too\s*Many\s*Requests/i.test(msg);
        if (!is429 || attempt === maxAttempts) break;
        const delayMs = 500 * Math.pow(2, attempt - 1);
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
    const message = lastErr?.message || 'AI provider rate limit reached';
    if (String(message).includes('429') || /Too\s*Many\s*Requests/i.test(String(message))) {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }
    throw new HttpException(message, HttpStatus.BAD_GATEWAY);
  }

  async generateTitles(input: {
    currentTitle: string;
    description?: string;
    keywords?: string[];
    language?: 'bn' | 'en';
  }): Promise<string[]> {
    const language = input.language || 'bn';
    const langName = language === 'bn' ? 'Bangla' : 'English';

    const prompt = `You are a YouTube SEO expert. Generate 5 viral ${langName} video titles based on the following:

Current Title: ${input.currentTitle}
${input.description ? `Description: ${input.description}` : ''}
${input.keywords ? `Keywords: ${input.keywords.join(', ')}` : ''}

Requirements:
- Each title must be under 70 characters
- Make them catchy, engaging, and click-worthy
- Include relevant keywords naturally
- Use ${langName} language
- Format: Return only the 5 titles, one per line, numbered 1-5

Generate the titles now:`;

    try {
      const text = await this.generateWithRetry(prompt);

    // Parse the response
    const titles = text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(title => title.length > 0)
      .slice(0, 5);

      return titles;
    } catch (err: any) {
      const message = err?.message || 'AI provider error while generating titles';
      console.error('[AI] generateTitles error:', message);
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }

  async generateDescription(input: {
    title: string;
    keywords?: string[];
    language?: 'bn' | 'en';
    duration?: string;
  }): Promise<string> {
    const language = input.language || 'bn';
    const langName = language === 'bn' ? 'Bangla' : 'English';

    const prompt = `You are a YouTube SEO expert. Write an engaging ${langName} video description for:

Title: ${input.title}
${input.keywords ? `Keywords: ${input.keywords.join(', ')}` : ''}
${input.duration ? `Video Duration: ${input.duration}` : ''}

Requirements:
- Write 200-300 words in ${langName}
- Include relevant keywords naturally
- Add timestamps if applicable
- Include call-to-action (like, subscribe, comment)
- Add relevant hashtags at the end
- Make it SEO-friendly and engaging

Generate the description now:`;

    try {
      const text = await this.generateWithRetry(prompt);
      return text;
    } catch (err: any) {
      const message = err?.message || 'AI provider error while generating description';
      console.error('[AI] generateDescription error:', message);
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }

  async generateTags(input: {
    title: string;
    description?: string;
    language?: 'bn' | 'en';
  }): Promise<string[]> {
    const language = input.language || 'bn';
    const langName = language === 'bn' ? 'Bangla' : 'English';

    const prompt = `You are a YouTube SEO expert. Generate 15-20 relevant tags for this video:

Title: ${input.title}
${input.description ? `Description: ${input.description}` : ''}

Requirements:
- Mix of ${langName} and English tags
- Include broad and specific tags
- Focus on searchable keywords
- Format: Return only the tags, comma-separated

Generate the tags now:`;

    try {
      const text = await this.generateWithRetry(prompt);

      // Parse tags
      const tags = text
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length < 50)
        .slice(0, 20);

      return tags;
    } catch (err: any) {
      const message = err?.message || 'AI provider error while generating tags';
      console.error('[AI] generateTags error:', message);
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }

  async analyzeKeywords(keyword: string, language: 'bn' | 'en' = 'bn'): Promise<any> {
    const langName = language === 'bn' ? 'Bangla' : 'English';

    const prompt = `You are a YouTube keyword research expert. Analyze this keyword: "${keyword}"

Provide:
1. Search volume estimate (High/Medium/Low)
2. Competition level (High/Medium/Low)
3. 10 related keywords in ${langName}
4. SEO difficulty score (1-10)
5. Best practices for using this keyword

Format your response as JSON with keys: searchVolume, competition, relatedKeywords (array), seoDifficulty, bestPractices`;

    try {
      const text = await this.generateWithRetry(prompt);

      try {
        // Try to parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Error parsing AI response:', error);
      }

      // Fallback response
      return {
        searchVolume: 'Medium',
        competition: 'Medium',
        relatedKeywords: [],
        seoDifficulty: 5,
        bestPractices: text,
      };
    } catch (err: any) {
      const message = err?.message || 'AI provider error while analyzing keyword';
      console.error('[AI] analyzeKeywords error:', message);
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }

  async saveGeneration(userId: string, type: string, input: any, output: any) {
    return this.databaseService.saveAIGeneration({
      user_id: userId,
      generation_type: type,
      input_data: input,
      output_data: output,
      created_at: new Date().toISOString(),
    });
  }

  async analyzeTitle(userId: string, input: { title: string; language?: 'bn'|'en'; videoId?: string }) {
    const language = input.language || 'bn';
    const langName = language === 'bn' ? 'Bangla' : 'English';
    const prompt = `You are a YouTube SEO expert. Evaluate this ${langName} video title and return JSON with keys: score (0-100), issues (array of strings), suggestions (array of strings), bestPractices (string).

Title: ${input.title}
`;
    const text = await this.generateWithRetry(prompt);
    let result: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 70, issues: [], suggestions: [], bestPractices: text };
    } catch { result = { score: 70, issues: [], suggestions: [], bestPractices: text }; }
    await this.databaseService.getClient().from('title_analyses').insert({
      user_id: userId,
      video_id: input.videoId || null,
      input: { title: input.title, language },
      output: result,
      score: result.score ?? null,
    });
    return result;
  }

  async analyzeDescription(userId: string, input: { description: string; language?: 'bn'|'en'; videoId?: string }) {
    const language = input.language || 'bn';
    const langName = language === 'bn' ? 'Bangla' : 'English';
    const prompt = `You are a YouTube SEO expert. Evaluate this ${langName} video description and return JSON with keys: score (0-100), issues (array), suggestions (array), keywords (array).

Description:\n${input.description}\n`;
    const text = await this.generateWithRetry(prompt);
    let result: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 70, issues: [], suggestions: [], keywords: [] };
    } catch { result = { score: 70, issues: [], suggestions: [], keywords: [] }; }
    await this.databaseService.getClient().from('description_analyses').insert({
      user_id: userId,
      video_id: input.videoId || null,
      input: { description: input.description, language },
      output: result,
      score: result.score ?? null,
    });
    return result;
  }

  async analyzeTags(userId: string, input: { tags: string[]; language?: 'bn'|'en'; videoId?: string }) {
    const language = input.language || 'bn';
    const langName = language === 'bn' ? 'Bangla' : 'English';
    const prompt = `You are a YouTube SEO expert. Evaluate this list of tags for a ${langName} video. Return JSON with keys: coverage (0-100), duplicates (array), missingTopics (array), suggestions (array).

Tags: ${input.tags.join(', ')}\n`;
    const text = await this.generateWithRetry(prompt);
    let result: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { coverage: 70, duplicates: [], missingTopics: [], suggestions: [] };
    } catch { result = { coverage: 70, duplicates: [], missingTopics: [], suggestions: [] }; }
    await this.databaseService.getClient().from('tag_analyses').insert({
      user_id: userId,
      video_id: input.videoId || null,
      input: { tags: input.tags, language },
      output: result,
    });
    return result;
  }

  async analyzeThumbnail(userId: string, input: { imageUrl?: string; videoId?: string }) {
    if (!input.imageUrl) {
      throw new HttpException('imageUrl is required', HttpStatus.BAD_REQUEST);
    }
    // Fetch the image and convert to base64 inline data
    const resp = await fetch(input.imageUrl);
    if (!resp.ok) throw new HttpException('Failed to fetch image', HttpStatus.BAD_REQUEST);
    const buf = await resp.arrayBuffer();
    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    const b64 = Buffer.from(buf).toString('base64');

    const prompt = `You are a YouTube thumbnail expert. Analyze the provided image and return JSON with keys:
score (0-100), brightness (0-100), contrast (0-100), textPresence (Low/Medium/High), facePresence (Low/Medium/High),
colorNotes (string), recommendations (array of strings), checklist (array of strings).`;

    // Multimodal prompt: text + image
    const mm = await this.model.generateContent([
      { text: prompt },
      { inlineData: { data: b64, mimeType: contentType } },
    ]);
    const text = (await mm.response).text();

    let result: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 70, recommendations: [text], checklist: [] };
    } catch {
      result = { score: 70, recommendations: [text], checklist: [] };
    }

    await this.databaseService.getClient().from('thumbnail_analyses').insert({
      user_id: userId,
      video_id: input.videoId || null,
      overall_score: result.score ?? null,
      details: result,
      created_at: new Date().toISOString(),
    });
    return result;
  }

  async analyzeThumbnailFromBuffer(userId: string, fileBuffer: Buffer, mimeType = 'image/jpeg', videoId?: string) {
    const prompt = `You are a YouTube thumbnail expert. Analyze the provided image and return JSON with keys:
score (0-100), brightness (0-100), contrast (0-100), textPresence (Low/Medium/High), facePresence (Low/Medium/High),
colorNotes (string), recommendations (array of strings), checklist (array of strings).`;

    const b64 = Buffer.from(fileBuffer).toString('base64');
    const mm = await this.model.generateContent([
      { text: prompt },
      { inlineData: { data: b64, mimeType } },
    ]);
    const text = (await mm.response).text();

    let result: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 70, recommendations: [text], checklist: [] };
    } catch {
      result = { score: 70, recommendations: [text], checklist: [] };
    }

    await this.databaseService.getClient().from('thumbnail_analyses').insert({
      user_id: userId,
      video_id: videoId || null,
      overall_score: result.score ?? null,
      details: result,
      created_at: new Date().toISOString(),
    });
    return result;
  }
}
