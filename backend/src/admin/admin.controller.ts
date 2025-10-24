import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { DatabaseService } from '../database/database.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private db: DatabaseService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Admin overview with optional filters' })
  async overview(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('route') route?: string,
    @Query('service') service?: 'ai' | 'youtube' | 'web',
  ) {
    const client = this.db.getClient();

    if (start || end || route || service) {
      // Try RPC if defined in DB for percentiles/quota; fallback to basic aggregation
      try {
        const { data, error } = await client.rpc('admin_overview_range', {
          p_start: start || null,
          p_end: end || null,
          p_route_pattern: route || null,
          p_service: service || null,
        }).single();
        if (error) throw error;
        return data || {};
      } catch {
        // basic fallback counts from request_logs
        let q = client.from('request_logs').select('*', { count: 'exact', head: false });
        if (start) q = q.gte('created_at', start);
        if (end) q = q.lte('created_at', end);
        if (route) q = q.ilike('route', `%${route}%`);
        if (service) q = q.eq('service', service);
        const { data, error } = await q;
        if (error) throw error;
        const ok2 = data.filter((d: any) => d.status >= 200 && d.status < 300).length;
        const e4 = data.filter((d: any) => d.status >= 400 && d.status < 500).length;
        const e5 = data.filter((d: any) => d.status >= 500 && d.status < 600).length;
        const e429 = data.filter((d: any) => d.status === 429).length;
        const dau = new Set((data as any[]).map((d) => d.user_email).filter(Boolean)).size;
        return { active_users_like: dau, ai_calls: data.filter((d: any) => d.service === 'ai').length, yt_calls: data.filter((d: any) => d.service === 'youtube').length, ok_2xx: ok2, err_4xx: e4, err_5xx: e5, err_429: e429 };
      }
    }

    const { data, error } = await client.from('v_admin_overview_30d').select('*').single();
    if (error) throw error;
    return data || {};
  }

  @Get('ai-usage')
  @ApiOperation({ summary: 'AI usage timeseries' })
  async aiUsage(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('route') route?: string,
  ) {
    const client = this.db.getClient();
    if (start || end || route) {
      let q = client.from('request_logs').select('created_at,status').eq('service', 'ai');
      if (start) q = q.gte('created_at', start);
      if (end) q = q.lte('created_at', end);
      if (route) q = q.ilike('route', `%${route}%`);
      const { data, error } = await q;
      if (error) throw error;
      // group by day in JS
      const byDay: Record<string, { ok_2xx: number; err_4xx: number; err_5xx: number; err_429: number }> = {};
      (data || []).forEach((r: any) => {
        const day = new Date(r.created_at).toISOString().slice(0, 10);
        byDay[day] ||= { ok_2xx: 0, err_4xx: 0, err_5xx: 0, err_429: 0 };
        if (r.status >= 200 && r.status < 300) byDay[day].ok_2xx++;
        else if (r.status === 429) byDay[day].err_429++;
        else if (r.status >= 400 && r.status < 500) byDay[day].err_4xx++;
        else if (r.status >= 500 && r.status < 600) byDay[day].err_5xx++;
      });
      return Object.keys(byDay).sort().map((day) => ({ day, ...byDay[day] }));
    }
    const { data, error } = await client.from('v_ai_usage_timeseries').select('*');
    if (error) throw error;
    return data || [];
  }

  @Get('youtube-usage')
  @ApiOperation({ summary: 'YouTube usage timeseries' })
  async youtubeUsage(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('route') route?: string,
  ) {
    const client = this.db.getClient();
    if (start || end || route) {
      let q = client.from('request_logs').select('created_at,status').eq('service', 'youtube');
      if (start) q = q.gte('created_at', start);
      if (end) q = q.lte('created_at', end);
      if (route) q = q.ilike('route', `%${route}%`);
      const { data, error } = await q;
      if (error) throw error;
      const byDay: Record<string, { ok_2xx: number; err_4xx: number; err_5xx: number; err_429: number }> = {};
      (data || []).forEach((r: any) => {
        const day = new Date(r.created_at).toISOString().slice(0, 10);
        byDay[day] ||= { ok_2xx: 0, err_4xx: 0, err_5xx: 0, err_429: 0 };
        if (r.status >= 200 && r.status < 300) byDay[day].ok_2xx++;
        else if (r.status === 429) byDay[day].err_429++;
        else if (r.status >= 400 && r.status < 500) byDay[day].err_4xx++;
        else if (r.status >= 500 && r.status < 600) byDay[day].err_5xx++;
      });
      return Object.keys(byDay).sort().map((day) => ({ day, ...byDay[day] }));
    }
    const { data, error } = await client.from('v_youtube_usage_timeseries').select('*');
    if (error) throw error;
    return data || [];
  }

  @Get('errors')
  @ApiOperation({ summary: 'Recent errors from request_logs' })
  async errors(
    @Query('limit') limit = '100',
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('route') route?: string,
    @Query('service') service?: 'ai' | 'youtube' | 'web',
  ) {
    const lim = Math.min(parseInt(limit as string, 10) || 100, 500);
    const client = this.db.getClient();
    let q = client.from('request_logs').select('*').gte('status', 400);
    if (start) q = q.gte('created_at', start);
    if (end) q = q.lte('created_at', end);
    if (route) q = q.ilike('route', `%${route}%`);
    if (service) q = q.eq('service', service);
    const { data, error } = await q.order('created_at', { ascending: false }).limit(lim);
    if (error) throw error;
    return data || [];
  }

  @Get('top-users')
  @ApiOperation({ summary: 'Top users by usage in last 30 days' })
  async topUsers() {
    const client = this.db.getClient();
    const { data, error } = await client.from('v_top_users_30d').select('*');
    if (error) throw error;
    return data || [];
  }

  @Get('latency')
  @ApiOperation({ summary: 'Latency percentiles and timeseries' })
  async latency(
    @Query('service') service: 'ai' | 'youtube' | 'web' = 'ai',
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('route') route?: string,
  ) {
    const client = this.db.getClient();
    let q = client.from('request_logs').select('created_at,latency_ms').eq('service', service).not('latency_ms', 'is', null);
    if (start) q = q.gte('created_at', start);
    if (end) q = q.lte('created_at', end);
    if (route) q = q.ilike('route', `%${route}%`);
    const { data, error } = await q.limit(50000);
    if (error) throw error;
    const latencies: number[] = (data || []).map((r: any) => Number(r.latency_ms)).filter((n) => Number.isFinite(n));
    latencies.sort((a, b) => a - b);
    const pct = (p: number) => {
      if (!latencies.length) return 0;
      const idx = Math.floor((p / 100) * (latencies.length - 1));
      return latencies[idx];
    };
    const avg = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    // by day
    const byDayMap: Record<string, number[]> = {};
    (data || []).forEach((r: any) => {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      (byDayMap[day] ||= []).push(Number(r.latency_ms));
    });
    const byDay = Object.keys(byDayMap).sort().map((day) => {
      const arr = byDayMap[day].sort((a, b) => a - b);
      const p = (pp: number) => {
        const idx = Math.floor((pp / 100) * (arr.length - 1));
        return arr[idx] || 0;
      };
      const a = arr.length ? Math.round(arr.reduce((x, y) => x + y, 0) / arr.length) : 0;
      return { day, p50: p(50), p90: p(90), p95: p(95), p99: p(99), avg: a };
    });
    return { overall: { p50: pct(50), p90: pct(90), p95: pct(95), p99: pct(99), avg }, byDay };
  }

  @Get('usage-breakdown')
  @ApiOperation({ summary: 'Usage breakdown by route and status group' })
  async usageBreakdown(
    @Query('service') service?: 'ai' | 'youtube' | 'web',
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('route') route?: string,
  ) {
    const client = this.db.getClient();
    let q = client.from('request_logs').select('route,status,service');
    if (service) q = q.eq('service', service);
    if (start) q = q.gte('created_at', start);
    if (end) q = q.lte('created_at', end);
    if (route) q = q.ilike('route', `%${route}%`);
    const { data, error } = await q.limit(50000);
    if (error) throw error;
    const map: Record<string, { route: string; service: string; ok_2xx: number; err_4xx: number; err_5xx: number; err_429: number; total: number }> = {};
    (data || []).forEach((r: any) => {
      const key = `${r.service}|${r.route}`;
      map[key] ||= { route: r.route, service: r.service, ok_2xx: 0, err_4xx: 0, err_5xx: 0, err_429: 0, total: 0 };
      const m = map[key];
      m.total++;
      if (r.status >= 200 && r.status < 300) m.ok_2xx++;
      else if (r.status === 429) m.err_429++;
      else if (r.status >= 400 && r.status < 500) m.err_4xx++;
      else if (r.status >= 500 && r.status < 600) m.err_5xx++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }

  @Get('errors.csv')
  @ApiOperation({ summary: 'Export recent errors as CSV' })
  async errorsCsv(
    @Res() res: Response,
    @Query('limit') limit = '1000',
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('route') route?: string,
    @Query('service') service?: 'ai' | 'youtube' | 'web',
  ) {
    const lim = Math.min(parseInt(limit as string, 10) || 1000, 5000);
    const client = this.db.getClient();
    let q = client.from('request_logs').select('*').gte('status', 400);
    if (start) q = q.gte('created_at', start);
    if (end) q = q.lte('created_at', end);
    if (route) q = q.ilike('route', `%${route}%`);
    if (service) q = q.eq('service', service);
    const { data, error } = await q.order('created_at', { ascending: false }).limit(lim);
    if (error) throw error;
    const rows = data || [];
    const headers = ['created_at','service','route','method','status','latency_ms','user_email','error_code'];
    const csv = [headers.join(',')]
      .concat(rows.map((r: any) => headers.map((h) => {
        const v = r[h];
        const s = (v === undefined || v === null) ? '' : String(v).replaceAll('"', '""');
        return `"${s}"`;
      }).join(',')))
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="errors.csv"');
    res.send(csv);
  }

  @Get('usage.csv')
  @ApiOperation({ summary: 'Export usage (request_logs) as CSV' })
  async usageCsv(
    @Res() res: Response,
    @Query('limit') limit = '5000',
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('route') route?: string,
    @Query('service') service?: 'ai' | 'youtube' | 'web',
  ) {
    const lim = Math.min(parseInt(limit as string, 10) || 5000, 20000);
    const client = this.db.getClient();
    let q = client.from('request_logs').select('*');
    if (start) q = q.gte('created_at', start);
    if (end) q = q.lte('created_at', end);
    if (route) q = q.ilike('route', `%${route}%`);
    if (service) q = q.eq('service', service);
    const { data, error } = await q.order('created_at', { ascending: false }).limit(lim);
    if (error) throw error;
    const rows = data || [];
    const headers = ['created_at','service','route','method','status','latency_ms','user_email'];
    const csv = [headers.join(',')]
      .concat(rows.map((r: any) => headers.map((h) => {
        const v = r[h];
        const s = (v === undefined || v === null) ? '' : String(v).replaceAll('"', '""');
        return `"${s}"`;
      }).join(',')))
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="usage.csv"');
    res.send(csv);
  }
}
