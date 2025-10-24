'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StatsCard } from '@/components/stats-card';
import { ChannelChart } from '@/components/channel-chart';
import { AdSenseUnit } from '@/components/adsense';
import { apiClient } from '@/lib/api';
import { TrendingUp, TrendingDown, Eye, Users, Clock, ThumbsUp } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();

  if (status === 'unauthenticated') {
    redirect('/');
  }

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiClient.getChannelAnalytics(),
    enabled: !!session,
  });

  const { data: growthData } = useQuery({
    queryKey: ['growth-trends'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/growth`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    },
    enabled: !!session,
  });

  const { data: topVideos } = useQuery({
    queryKey: ['top-videos'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/videos?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.json();
    },
    enabled: !!session,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-slate-400">
            Detailed insights about your channel performance
          </p>
        </div>

        {/* Growth Metrics */}
        {growthData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Views Growth"
              value={`${growthData.viewsGrowth}%`}
              icon={Eye}
              trend={`${growthData.viewsGrowth}%`}
              trendUp={parseFloat(growthData.viewsGrowth) > 0}
            />
            <StatsCard
              title="Subscribers Growth"
              value={`${growthData.subscribersGrowth}%`}
              icon={Users}
              trend={`${growthData.subscribersGrowth}%`}
              trendUp={parseFloat(growthData.subscribersGrowth) > 0}
            />
            <StatsCard
              title="Engagement Growth"
              value={`${growthData.engagementGrowth}%`}
              icon={ThumbsUp}
              trend={`${growthData.engagementGrowth}%`}
              trendUp={parseFloat(growthData.engagementGrowth) > 0}
            />
          </div>
        )}

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

        {/* Ad Slot */}
        <AdSenseUnit
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD!}
          format="horizontal"
        />

        {/* Top Performing Videos */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Top Performing Videos</h3>
          
          {topVideos && topVideos.length > 0 ? (
            <div className="space-y-4">
              {topVideos.map((video: any, index: number) => (
                <div
                  key={video.video_id}
                  className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  
                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1 truncate">{video.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {video.view_count?.toLocaleString() || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {video.like_count?.toLocaleString() || 0} likes
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <a
                      href={`https://youtube.com/watch?v=${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No video data available yet</p>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Best Performing Days</h3>
            <div className="space-y-3">
              {['Monday', 'Wednesday', 'Friday'].map((day, index) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm">{day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${100 - index * 20}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{100 - index * 20}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Audience Retention</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average View Duration</span>
                  <span className="font-medium">
                    {analyticsData?.avgViewDuration || '0'} min
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Watch Time</span>
                  <span className="font-medium">{analyticsData?.watchTime || '0h'}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Click-Through Rate</span>
                  <span className="font-medium">{analyticsData?.avgCTR || '0%'}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-green-500 mb-1">Great Job!</div>
                <p className="text-sm text-muted-foreground">
                  Your engagement rate is above average. Keep creating engaging content!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-500 mb-1">Opportunity</div>
                <p className="text-sm text-muted-foreground">
                  Consider posting more frequently. Consistent uploads can boost your growth.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-500 mb-1">Tip</div>
                <p className="text-sm text-muted-foreground">
                  Use our AI tools to optimize your titles and descriptions for better reach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
