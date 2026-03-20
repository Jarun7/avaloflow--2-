import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutGrid, 
  List, 
  BarChart2, 
  MessageSquare, 
  Send, 
  MoreVertical, 
  ArrowRight,
  PlusCircle,
  Play,
  Loader2,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  comments: number;
  sentDms: number;
  image: string;
  stat: string;
  label: string;
  updatedAt: string;
  flowId?: string;
}

export function FlowsLibrary() {
  const [flows, setFlows] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      setFlows(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const stats = [
    { 
      icon: BarChart2, 
      label: 'Total Engagement', 
      value: flows.reduce((acc, f) => acc + f.comments + f.sentDms, 0).toLocaleString(), 
      change: '+12.5%', 
      color: 'text-primary',
      bg: 'bg-primary/10',
      progress: 75
    },
    { 
      icon: MessageSquare, 
      label: 'Comments Auto-Replied', 
      value: flows.reduce((acc, f) => acc + f.comments, 0).toLocaleString(), 
      change: 'Active', 
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      desc: `Across ${flows.filter(f => f.status === 'active').length} active campaigns`
    },
    { 
      icon: Send, 
      label: 'DMs Delivered', 
      value: flows.reduce((acc, f) => acc + f.sentDms, 0).toLocaleString(), 
      change: 'Steady', 
      color: 'text-tertiary',
      bg: 'bg-tertiary/10',
      desc: '99.8% Deliverability rate'
    },
  ];

  const handleSimulate = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}/simulate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to simulate campaign');
      
      toast.success(`Campaign "${name}" executed!`, {
        description: 'Check your dashboard for updated stats.'
      });
      
      // Refresh flows
      const refreshRes = await fetch('/api/campaigns');
      const data = await refreshRes.json();
      setFlows(data);
    } catch (error) {
      console.error('Error simulating campaign:', error);
      toast.error('Failed to execute campaign');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete campaign');
      
      toast.success('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const filteredFlows = flows.filter(flow => 
    flow.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    flow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-[3.5rem] font-extrabold font-headline text-on-surface leading-tight tracking-tight">Flows Library</h2>
          <p className="text-on-surface-variant text-base md:text-lg font-medium mt-2">Manage and monitor your multi-channel automation performance.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-surface-container-lowest p-1 rounded-xl flex items-center shadow-sm border border-outline-variant/10 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2 bg-surface-container-highest text-primary font-bold rounded-lg text-sm flex items-center justify-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button className="flex-1 md:flex-none px-4 py-2 text-on-surface-variant font-medium rounded-lg text-sm hover:bg-surface-container-low flex items-center justify-center gap-2">
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid Stats Layout */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            className={cn(
              "col-span-12 lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl no-line-card border border-outline-variant/10",
              idx === 0 ? "lg:col-span-4" : "md:col-span-6 lg:col-span-4"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className={cn("text-xs font-bold px-2 py-1 rounded-full", stat.bg, stat.color)}>
                {stat.change}
              </span>
            </div>
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold font-headline mt-1 text-on-surface">{stat.value}</p>
            
            {stat.progress ? (
              <div className="mt-4 h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full primary-gradient" style={{ width: `${stat.progress}%` }}></div>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant mt-2">{stat.desc}</p>
            )}
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-outline-variant/10 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Flows Grid */}
      {filteredFlows.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-12 text-center">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No campaigns found</h3>
          <p className="text-on-surface-variant mb-6">
            {searchQuery ? "No campaigns match your search criteria." : "You haven't created any campaigns yet."}
          </p>
          {!searchQuery && (
            <Link 
              to="/templates"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Create Campaign
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFlows.map((flow) => (
          <div 
            key={flow.id}
            className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/15 hover:shadow-2xl hover:shadow-on-surface/5 transition-all duration-300"
          >
            <div className="h-32 bg-surface-container-low relative overflow-hidden">
              <div className="absolute inset-0 primary-gradient opacity-10"></div>
              <img 
                className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" 
                src={flow.image} 
                alt={flow.name}
              />
              <div className={cn(
                "absolute top-4 right-4 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm",
                flow.status === 'active' ? 'bg-primary' : 'bg-on-surface-variant'
              )}>
                {flow.status}
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold font-headline text-on-surface">{flow.name}</h3>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(flow.id);
                  }}
                  className="p-1 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-lg transition-colors"
                  title="Delete Campaign"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-6 min-h-[2.5rem]">{flow.description}</p>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-outline-variant/10">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Total Comments</p>
                  <p className="text-lg font-bold text-on-surface">{flow.comments.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">DMs Sent</p>
                  <p className="text-lg font-bold text-on-surface">{flow.sentDms.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <img 
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover" 
                      src={`https://picsum.photos/seed/user${flow.id}${i}/100/100`} 
                      alt="User"
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSimulate(flow.id, flow.name)}
                    className="text-xs font-bold flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-500/10 px-2 py-1 rounded-md"
                    title="Simulate Campaign Execution"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Run
                  </button>
                  <Link to={flow.flowId ? `/automations/${flow.flowId}` : "/automations"} className={cn(
                    "text-xs font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-md",
                    flow.status === 'active' ? "text-primary hover:bg-primary/10" : "text-on-surface-variant hover:bg-surface-container-low"
                  )}>
                    {flow.status === 'active' ? 'Edit' : 'Resume'}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Placeholder Card */}
        <Link to="/automations" className="group border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-surface-container-low transition-all cursor-pointer min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            <PlusCircle className="w-8 h-8 text-on-surface-variant group-hover:text-primary transition-colors" />
          </div>
          <h4 className="text-lg font-bold text-on-surface font-headline">Create New Flow</h4>
          <p className="text-sm text-on-surface-variant mt-2 text-center">Start from a template or build from scratch.</p>
        </Link>
      </div>
      )}
    </div>
  );
}
