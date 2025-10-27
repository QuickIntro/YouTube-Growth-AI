'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StatsCard } from '@/components/stats-card';
import { ChannelChart } from '@/components/channel-chart';
import { AdSenseUnit } from '@/components/adsense';
import { apiClient } from '@/lib/api';
import { Eye, TrendingUp, Clock, Users, Upload, CalendarClock } from 'lucide-react';
import { UploadModal } from '@/components/UploadModal';
import { ScheduleModal } from '@/components/ScheduleModal';
import { CommentsPanel } from '@/components/CommentsPanel';
import { PlaylistsPanel } from '@/components/PlaylistsPanel';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [showUpload, setShowUpload] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  if (status === 'unauthenticated') {
    redirect('/api/auth/signin');
  }

  const { data: channelData, isLoading } = useQuery({
    queryKey: ['channel-stats'],
    queryFn: () => apiClient.getChannelStats(),
    enabled: !!session,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['channel-analytics'],
    queryFn: () => apiClient.getChannelAnalytics(),
    enabled: !!session,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Welcome back, {channelData?.channelTitle || 'User'}!
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowUpload(true)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2">
            <Upload className="w-4 h-4"/> Upload
          </button>
          <button onClick={() => setShowSchedule(true)} disabled={!selectedVideoId} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 flex items-center gap-2">
            <CalendarClock className="w-4 h-4"/> Schedule
          </button>
          {selectedVideoId && (
            <div className="text-sm text-muted-foreground">Selected video: {selectedVideoId}</div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Views"
            value={channelData?.viewCount?.toLocaleString() || '0'}
            icon={Eye}
            trend="+12.5%"
            trendUp={true}
          />
          <StatsCard
            title="Subscribers"
            value={channelData?.subscriberCount?.toLocaleString() || '0'}
            icon={Users}
            trend="+8.2%"
            trendUp={true}
          />
          <StatsCard
            title="Avg CTR"
            value={analyticsData?.avgCTR || '0%'}
            icon={TrendingUp}
            trend="+2.1%"
            trendUp={true}
          />
          <StatsCard
            title="Watch Time"
            value={analyticsData?.watchTime || '0h'}
            icon={Clock}
            trend="+15.3%"
            trendUp={true}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
            <ChannelChart data={analyticsData?.viewsData || []} />
          </div>
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Engagement Rate</h3>
            <ChannelChart data={analyticsData?.engagementData || []} />
          </div>
        </div>

        {/* AdSense */}
        <AdSenseUnit
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD!}
          format="horizontal"
          className="my-8"
        />

        {/* Recent Videos */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Recent Videos</h3>
          <div className="space-y-4">
            {channelData?.recentVideos?.map((video: any) => (
              <div
                key={video.id}
                className={`flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${selectedVideoId===video.id? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedVideoId(video.id)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{video.title}</h4>
                  <p className="text-sm text-slate-400">
                    {video.views} views · {video.publishedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CommentsPanel videoId={selectedVideoId || channelData?.recentVideos?.[0]?.id || ''} />
          <PlaylistsPanel selectedVideoId={selectedVideoId || undefined} />
        </div>
      </div>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} />
      <ScheduleModal open={showSchedule} onClose={() => setShowSchedule(false)} videoId={selectedVideoId || channelData?.recentVideos?.[0]?.id || ''} />
    </DashboardLayout>
  );
}
