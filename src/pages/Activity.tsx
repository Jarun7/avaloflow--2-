import React, { useEffect, useState } from 'react';
import { 
  UserPlus, 
  Radio, 
  Edit2, 
  LineChart, 
  Filter, 
  Search, 
  Calendar, 
  MoreVertical,
  ArrowRight,
  Zap,
  ShoppingCart,
  Mail,
  MessageSquare,
  Share2,
  Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
  color: string;
  category: string;
}

const iconMap: Record<string, any> = {
  UserPlus,
  Radio,
  Edit2,
  LineChart,
  Zap,
  ShoppingCart,
  Mail,
  MessageSquare,
  Share2
};

export function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activity');
        if (!response.ok) throw new Error('Failed to fetch activity');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
        toast.error('Failed to load activity feed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Activity Feed</h1>
          <p className="text-on-surface-variant mt-1">Real-time log of all events across your marketing ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all">
            <Calendar className="w-4 h-4" />
            Select Dates
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search activity..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
          {['All', 'Campaign', 'Audience', 'Automation', 'Analytics', 'Sales'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl no-line-card border border-outline-variant/10">
        <div className="space-y-12 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-outline-variant/30"></div>
          
          {filteredActivities.length > 0 ? (
            filteredActivities.map((item) => {
              const IconComponent = iconMap[item.icon] || Zap;
              return (
                <div key={item.id} className="relative flex gap-6 group">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center z-10 ring-8 ring-white transition-transform group-hover:scale-110 shadow-sm", item.color)}>
                    <IconComponent className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-bold text-on-surface">{item.title}</p>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[10px] font-bold text-primary tracking-wider">{item.time}</span>
                        <button className="text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                          View Details <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant hover:text-on-surface transition-all self-start">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-on-surface-variant">No activity found matching your criteria.</p>
            </div>
          )}
        </div>
        
        {filteredActivities.length > 0 && (
          <div className="mt-12 pt-8 border-t border-outline-variant/10 flex justify-center">
            <button className="px-8 py-3 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all">
              Load More Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
