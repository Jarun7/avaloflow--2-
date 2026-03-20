import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { 
  TrendingUp, 
  PlusCircle, 
  Send, 
  ChevronRight, 
  Calendar, 
  MoreVertical,
  Mail,
  ShoppingCart,
  Zap,
  UserPlus,
  Radio,
  Edit2,
  LineChart,
  Filter,
  Pause,
  Rocket,
  Play
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '@/src/lib/utils';

export function Dashboard() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFlow, setDeletingFlow] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [activeAutomations, setActiveAutomations] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, campaignsRes, activityRes, chartRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/campaigns'),
          fetch('/api/activity'),
          fetch('/api/chart-data')
        ]);

        const statsData = await statsRes.json();
        const campaignsData = await campaignsRes.json();
        const activityData = await activityRes.json();
        const chartData = await chartRes.json();

        setStats(Array.isArray(statsData) ? statsData : []);
        setChartData(Array.isArray(chartData) ? chartData : []);
        
        const safeCampaigns = Array.isArray(campaignsData) ? campaignsData : [];
        setActiveAutomations(safeCampaigns.slice(0, 3).map((c: any) => ({
          ...c,
          icon: c.name.toLowerCase().includes('welcome') ? Mail : 
                c.name.toLowerCase().includes('holiday') ? ShoppingCart : Zap,
          color: c.status === 'active' ? 'bg-surface-container-highest text-primary' : 'bg-surface-container-high text-on-surface-variant'
        })));
        
        const safeActivity = Array.isArray(activityData) ? activityData : [];
        setActivityFeed(safeActivity.map((a: any) => ({
          ...a,
          icon: a.icon === 'Rocket' ? Rocket : a.icon === 'UserPlus' ? UserPlus : a.icon === 'Play' ? Play : Pause
        })));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLaunch = () => {
    toast.success('Campaign launched successfully!', {
      description: 'Your audience will start receiving messages shortly.',
    });
  };

  const openDeleteModal = (e: React.MouseEvent, flowName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingFlow(flowName);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFlow = async () => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      toast.error(`Flow "${deletingFlow}" deleted`, {
        description: 'This action cannot be undone.',
      });
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setActiveAutomations(data.slice(0, 3).map((c: any) => ({
        ...c,
        icon: c.name.toLowerCase().includes('welcome') ? Mail : 
              c.name.toLowerCase().includes('holiday') ? ShoppingCart : Zap,
        color: c.status === 'active' ? 'bg-surface-container-highest text-primary' : 'bg-surface-container-high text-on-surface-variant'
      })));
    } catch (error) {
      setIsDeleting(false);
      toast.error('Failed to delete flow');
    }
  };

  const getStat = (key: string) => stats.find(s => s.key === key);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalAudience = getStat('total_audience')?.value || '0';
  const audienceTrend = getStat('total_audience')?.trend || '0%';
  const audienceIsPositive = getStat('total_audience')?.isPositive ?? true;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section: Bento Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Total Audience Card */}
        <section className="lg:col-span-8 primary-gradient p-6 md:p-10 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[260px] md:min-h-[320px] shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/10 text-white/90 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
              <LineChart className="w-3.5 h-3.5" />
              Live Metric
            </div>
            <h2 className="text-white/80 font-headline mt-6 text-base md:text-xl font-medium">Total Audience</h2>
            <div className="flex items-baseline gap-3 md:gap-6 mt-2 flex-wrap">
              <span className="text-white font-headline text-5xl md:text-7xl font-extrabold tracking-tight">{totalAudience}</span>
              <div className="bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs md:text-base font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/10">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                {audienceTrend}
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-4 mt-8">
            <div className="flex -space-x-3 md:-space-x-4">
              {[1, 2, 3].map((i) => (
                <img 
                  key={i}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary object-cover shadow-lg" 
                  src={`https://picsum.photos/seed/user${i}/100/100`} 
                  alt="Avatar"
                />
              ))}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary bg-primary-container flex items-center justify-center text-[10px] md:text-xs text-white font-black shadow-lg">+839</div>
            </div>
            <p className="text-white/70 text-xs md:text-sm font-bold tracking-wide">New contacts added this week</p>
          </div>

          {/* Abstract Background Shapes */}
          <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
          <div className="absolute right-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px]"></div>
        </section>

        {/* Quick Actions Card */}
        <section className="lg:col-span-4 bg-surface-container-lowest p-6 md:p-8 rounded-2xl flex flex-col justify-between no-line-card border border-outline-variant/10">
          <div>
            <h3 className="font-headline text-lg md:text-xl font-extrabold mb-2 text-on-surface">Quick Actions</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">Efficiently manage your growth cycles with targeted operations.</p>
          </div>
          <div className="space-y-3">
            <Link to="/automations" className="w-full bg-surface-container-high text-on-primary-fixed-variant py-3 rounded-xl font-bold flex items-center justify-between px-4 hover:bg-surface-container-highest transition-all group">
              <span className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5" />
                New Flow
              </span>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/campaigns" className="w-full bg-surface-container-high text-on-primary-fixed-variant py-3 rounded-xl font-bold flex items-center justify-between px-4 hover:bg-surface-container-highest transition-all group">
              <span className="flex items-center gap-3">
                <Send className="w-5 h-5" />
                Send Broadcast
              </span>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/templates" className="w-full text-primary py-2 rounded-lg font-bold text-sm text-center hover:bg-surface-container-low transition-all block">
              View All Actions
            </Link>
          </div>
        </section>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.filter(s => s.key !== 'total_audience').map((stat, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-5 md:p-6 rounded-3xl border border-outline-variant/10 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-xl", stat.isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-error/10 text-error")}>
                <TrendingUp className={cn("w-4 h-4", !stat.isPositive && "rotate-180")} />
              </div>
              <span className={cn("text-[10px] font-bold", stat.isPositive ? "text-emerald-600" : "text-error")}>{stat.trend}</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl md:text-3xl font-headline font-bold text-on-surface">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Body: Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Flows Chart & List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-2xl no-line-card">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Recent Flows</h3>
                <p className="text-on-surface-variant text-sm">Engagement performance across active automations</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white shadow-sm border border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                  <Calendar className="w-4 h-4 text-on-surface-variant" />
                </button>
                <button className="p-2 rounded-lg bg-white shadow-sm border border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                  <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>
            </div>
            
            {/* Real Bar Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 88, 195, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#414754' }}
                    dy={10}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'WED' ? '#0058c3' : '#a6c1fe'} 
                        className={entry.name === 'WED' ? 'drop-shadow-[0_4px_10px_rgba(0,88,195,0.3)]' : ''}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Flow List */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl no-line-card border border-outline-variant/10">
            <h4 className="font-headline font-bold mb-6 text-base text-on-surface">Active Automations</h4>
            <div className="space-y-2">
              {activeAutomations.map((item, idx) => (
                <Link 
                  key={idx}
                  to="/automations"
                  className="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors rounded-xl cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                      <item.icon className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{item.name}</p>
                      <p className="text-xs text-on-surface-variant">{item.steps} steps • Last updated {new Date(item.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-sm text-primary">{item.stat}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{item.label}</p>
                    </div>
                    <button 
                      onClick={(e) => openDeleteModal(e, item.name)}
                      className="p-2 hover:bg-error/10 hover:text-error rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1">
          <section className="bg-surface-container-lowest p-6 rounded-2xl no-line-card border border-outline-variant/10 h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline text-lg font-bold text-on-surface">Activity Feed</h3>
              <Filter className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
            </div>
            
            <div className="space-y-8 relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-outline-variant/30"></div>
              
              {activityFeed.map((item, idx) => (
                <Link key={idx} to="/activity" className="relative flex gap-4 group">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center z-10 ring-4 ring-white transition-transform group-hover:scale-110", item.color)}>
                    <item.icon className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{item.desc}</p>
                    <span className="text-[10px] font-bold text-primary-container mt-2 inline-block tracking-wider">{new Date(item.time).toLocaleTimeString()}</span>
                  </div>
                </Link>
              ))}
            </div>
            
            <Link to="/activity" className="w-full mt-10 py-3 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all block text-center">
              See All Activity
            </Link>
          </section>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Automation"
        description={`Are you sure you want to delete "${deletingFlow}"?`}
        type="error"
        confirmLabel="Delete"
        onConfirm={handleDeleteFlow}
        isLoading={isDeleting}
      >
        <p className="text-sm text-on-surface-variant">
          Deleting this automation will stop all active sequences and remove all associated data. This action is permanent.
        </p>
      </Modal>
    </div>
  );
}
