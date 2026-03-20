import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  Loader2,
  Zap,
  Target
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface Stat {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: any;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  impressions: string;
  clicks: string;
  ctr: string;
  conversions: string;
}

const iconMap: Record<string, any> = {
  Users,
  MousePointer2,
  TrendingUp,
  Clock,
  DollarSign: BarChart3, // Fallback or use real icon if available
  Zap,
  Target
};

export function Analytics() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [channelData, setChannelData] = useState<ChartData[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, perfRes, chanRes, campRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/chart-data?type=performance'),
          fetch('/api/chart-data?type=channel'),
          fetch('/api/campaigns')
        ]);

        if (!statsRes.ok || !perfRes.ok || !chanRes.ok || !campRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const [statsData, perfData, chanData, campData] = await Promise.all([
          statsRes.json(),
          perfRes.json(),
          chanRes.json(),
          campRes.json()
        ]);

        // Map stats with icons
        const mappedStats = statsData.map((s: any) => ({
          ...s,
          icon: iconMap[s.icon] || BarChart3
        }));

        setStats(mappedStats);
        setPerformanceData(perfData);
        setChannelData(chanData);
        setCampaigns(campData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Analytics Insights</h1>
          <p className="text-on-surface-variant mt-1">Deep dive into your marketing performance and growth metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-on-primary-fixed-variant text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-6 rounded-2xl no-line-card border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-surface-container-low rounded-lg text-primary">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-error-container text-error"
              )}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-on-surface-variant text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-headline font-extrabold text-on-surface mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl no-line-card border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Growth Performance</h3>
              <p className="text-on-surface-variant text-sm">Audience acquisition over time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                Current
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant ml-4">
                <span className="w-3 h-3 rounded-full bg-surface-container-highest"></span>
                Previous
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0058c3" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0058c3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c1c6d7" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#414754' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#414754' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0058c3" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl no-line-card border border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Channel Split</h3>
          <p className="text-on-surface-variant text-sm mb-8">Distribution of engagement by platform</p>
          
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#0d1c2e' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0058c3'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-3">
            {channelData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#0058c3' }}></div>
                  <span className="text-sm font-medium text-on-surface-variant">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-on-surface">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-surface-container-lowest rounded-2xl no-line-card border border-outline-variant/10 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold text-on-surface">Campaign Breakdown</h3>
          <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Impressions</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Clicks</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">CTR</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Conversions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {campaigns.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-on-surface">{row.name}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      row.status.toLowerCase() === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-surface-container-high text-on-surface-variant"
                    )}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.impressions}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.clicks}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{row.ctr}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
