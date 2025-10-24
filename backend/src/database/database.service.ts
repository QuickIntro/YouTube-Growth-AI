import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // User operations
  async createUser(userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Channel operations
  async saveChannelData(channelData: any) {
    const { data, error } = await this.supabase
      .from('channels')
      .upsert(channelData, { onConflict: 'channel_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChannelByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Analytics operations
  async saveAnalytics(analyticsData: any) {
    const { data, error } = await this.supabase
      .from('analytics')
      .insert(analyticsData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAnalyticsByChannelId(channelId: string, days: number = 30) {
    const { data, error } = await this.supabase
      .from('analytics')
      .select('*')
      .eq('channel_id', channelId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // AI generations history
  async saveAIGeneration(generationData: any) {
    const { data, error } = await this.supabase
      .from('ai_generations')
      .insert(generationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAIGenerationHistory(userId: string, limit: number = 50) {
    const { data, error } = await this.supabase
      .from('ai_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
