import axios from 'axios';

// Default to same-origin so Next.js rewrites can proxy to backend in single-service deployments.
// Allow explicit override via NEXT_PUBLIC_API_URL when backend has a public URL.
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to set/remove auth token from NextAuth session
export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let callers decide how to handle 401 (e.g., trigger signIn with callback)
    return Promise.reject(error);
  }
);

// API Methods
export const apiClient = {
  // Channel
  async getChannelStats() {
    const { data } = await api.get('/api/youtube/channel');
    return data;
  },

  async getChannelAnalytics(days = 30) {
    const { data } = await api.get(`/api/youtube/analytics?days=${days}`);
    return data;
  },

  async getVideos() {
    const { data } = await api.get('/api/youtube/videos');
    return data;
  },

  // AI Tools
  async generateTitles(input: {
    currentTitle: string;
    description?: string;
    keywords?: string[];
    language?: 'bn' | 'en';
  }) {
    const { data } = await api.post('/api/ai/generate-titles', input);
    return data;
  },

  async generateDescription(input: {
    title: string;
    keywords?: string[];
    language?: 'bn' | 'en';
    duration?: string;
  }) {
    const { data } = await api.post('/api/ai/generate-description', input);
    return data;
  },

  async generateTags(input: {
    title: string;
    description?: string;
    language?: 'bn' | 'en';
  }) {
    const { data } = await api.post('/api/ai/generate-tags', input);
    return data;
  },

  async analyzeKeyword(keyword: string, language: 'bn' | 'en' = 'bn') {
    const { data } = await api.post('/api/ai/analyze-keyword', {
      keyword,
      language,
    });
    return data;
  },

  async analyzeTitle(input: { title: string; language?: 'bn'|'en'; videoId?: string }) {
    const { data } = await api.post('/api/ai/analyze-title', input);
    return data;
  },

  async analyzeDescriptionText(input: { description: string; language?: 'bn'|'en'; videoId?: string }) {
    const { data } = await api.post('/api/ai/analyze-description', input);
    return data;
  },

  async analyzeTagsSet(input: { tags: string[]; language?: 'bn'|'en'; videoId?: string }) {
    const { data } = await api.post('/api/ai/analyze-tags', input);
    return data;
  },

  async analyzeThumbnailHeuristic(input: { imageUrl?: string; videoId?: string }) {
    const { data } = await api.post('/api/ai/analyze-thumbnail', input);
    return data;
  },

  async listTitleAnalyses(params?: { videoId?: string; limit?: number }) {
    const search = new URLSearchParams({ ...(params as any), limit: String(params?.limit ?? 50) }).toString();
    const { data } = await api.get(`/api/ai/title-analyses${search ? `?${search}` : ''}`);
    return data;
  },
  async listDescriptionAnalyses(params?: { videoId?: string; limit?: number }) {
    const search = new URLSearchParams({ ...(params as any), limit: String(params?.limit ?? 50) }).toString();
    const { data } = await api.get(`/api/ai/description-analyses${search ? `?${search}` : ''}`);
    return data;
  },
  async listTagAnalyses(params?: { videoId?: string; limit?: number }) {
    const search = new URLSearchParams({ ...(params as any), limit: String(params?.limit ?? 50) }).toString();
    const { data } = await api.get(`/api/ai/tag-analyses${search ? `?${search}` : ''}`);
    return data;
  },
  async listThumbnailAnalyses(params?: { videoId?: string; limit?: number }) {
    const search = new URLSearchParams({ ...(params as any), limit: String(params?.limit ?? 50) }).toString();
    const { data } = await api.get(`/api/ai/thumbnail-analyses${search ? `?${search}` : ''}`);
    return data;
  },

  // Thumbnail
  async analyzeThumbnail(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/api/thumbnail/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // User
  async getUserProfile() {
    const { data } = await api.get('/api/auth/me');
    return data;
  },

  async updateUserSettings(settings: any) {
    const { data } = await api.patch('/api/auth/settings', settings);
    return data;
  },

  async deleteAccount() {
    const { data } = await api.delete('/api/auth/account');
    return data;
  },

  // Admin
  async adminOverview(params?: { start?: string; end?: string; route?: string; service?: 'ai'|'youtube'|'web' }) {
    const search = new URLSearchParams(params as any).toString();
    const { data } = await api.get(`/api/admin/overview${search ? `?${search}` : ''}`);
    return data;
  },
  async adminAIUsage(params?: { start?: string; end?: string; route?: string }) {
    const search = new URLSearchParams(params as any).toString();
    const { data } = await api.get(`/api/admin/ai-usage${search ? `?${search}` : ''}`);
    return data;
  },
  async adminYTUsage(params?: { start?: string; end?: string; route?: string }) {
    const search = new URLSearchParams(params as any).toString();
    const { data } = await api.get(`/api/admin/youtube-usage${search ? `?${search}` : ''}`);
    return data;
  },
  async adminErrors(limit = 100, params?: { start?: string; end?: string; route?: string; service?: 'ai'|'youtube'|'web' }) {
    const search = new URLSearchParams({ ...(params as any), limit: String(limit) }).toString();
    const { data } = await api.get(`/api/admin/errors?${search}`);
    return data;
  },
  async adminTopUsers() {
    const { data } = await api.get('/api/admin/top-users');
    return data;
  },
  async adminLatency(params?: { service?: 'ai'|'youtube'|'web'; start?: string; end?: string; route?: string }) {
    const search = new URLSearchParams(params as any).toString();
    const { data } = await api.get(`/api/admin/latency${search ? `?${search}` : ''}`);
    return data;
  },
  async adminUsageBreakdown(params?: { service?: 'ai'|'youtube'|'web'; start?: string; end?: string; route?: string }) {
    const search = new URLSearchParams(params as any).toString();
    const { data } = await api.get(`/api/admin/usage-breakdown${search ? `?${search}` : ''}`);
    return data;
  },
  adminErrorsCsvUrl(params?: { limit?: number; start?: string; end?: string; route?: string; service?: 'ai'|'youtube'|'web' }) {
    const search = new URLSearchParams({ limit: String(params?.limit ?? 1000), ...(params as any) }).toString();
    return `${API_URL}/api/admin/errors.csv?${search}`;
  },
  adminUsageCsvUrl(params?: { limit?: number; start?: string; end?: string; route?: string; service?: 'ai'|'youtube'|'web' }) {
    const search = new URLSearchParams({ limit: String(params?.limit ?? 5000), ...(params as any) }).toString();
    return `${API_URL}/api/admin/usage.csv?${search}`;
  },
};

export { api as default };
