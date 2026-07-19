import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Send,
  Users,
  Zap,
  MousePointerClick,
  Play,
  Loader2,
  Image,
  Film,
  PlayCircle,
  Radio,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ContentItem, ContentType } from '@/src/lib/autodmContent';
import { SourceType } from '../components/autodm/AutoDmWizard';

interface AutoDmRecord {
  id: string;
  name: string;
  sourceType: SourceType;
  content: ContentItem | null;
  status: string;
  triggerCount: number;
  messagesSent: number;
  uniqueUsers: number;
  updatedAt: string;
}

interface AutoDmEvent {
  id: string;
  autoDmId: string;
  contactName: string;
  contactAvatar: string;
  triggerText: string;
  messagesSent: number;
  createdAt: string;
  autoDm: { name: string; sourceType: SourceType };
}

const SOURCE_LABEL: Record<SourceType, string> = {
  post_reel: 'Posts/Reels',
  story: 'Stories',
  live: 'IG Live',
  dm: 'DMs',
  dm_post: 'DMs your post',
};

function sourceIcon(type: SourceType) {
  if (type === 'story') return PlayCircle;
  if (type === 'live') return Radio;
  if (type === 'dm' || type === 'dm_post') return MessageCircle;
  return Image;
}

function contentTypeIcon(type: ContentType) {
  if (type === 'reel') return Film;
  if (type === 'story') return PlayCircle;
  if (type === 'live') return Radio;
  return Image;
}

export function Analytics() {
  const [automations, setAutomations] = useState<AutoDmRecord[]>([]);
  const [events, setEvents] = useState<AutoDmEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [autoRes, eventsRes] = await Promise.all([
        fetch('/api/autodm'),
        fetch('/api/autodm/events'),
      ]);
      const autoData = await autoRes.json();
      const eventsData = await eventsRes.json();
      setAutomations(Array.isArray(autoData) ? autoData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const simulate = async (id: string) => {
    setSimulatingId(id);
    try {
      const res = await fetch(`/api/autodm/${id}/simulate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to simulate');
      toast.success('New activity simulated');
      await load();
    } catch (error) {
      toast.error('Failed to simulate activity');
    } finally {
      setSimulatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalAutomations = automations.length;
  const activeAutomations = automations.filter(a => a.status === 'active').length;
  const totalMessages = automations.reduce((sum, a) => sum + a.messagesSent, 0);
  const totalUsers = automations.reduce((sum, a) => sum + a.uniqueUsers, 0);
  const totalTriggers = automations.reduce((sum, a) => sum + a.triggerCount, 0);

  const chartData = automations
    .slice()
    .sort((a, b) => b.messagesSent - a.messagesSent)
    .slice(0, 8)
    .map(a => ({ name: a.name.length > 14 ? a.name.slice(0, 14) + '…' : a.name, value: a.messagesSent }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-1">Every message sent, every person reached — all your AutoDM activity in one place.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Zap} label="Automations" value={totalAutomations} />
        <StatCard icon={Play} label="Active now" value={activeAutomations} accent="emerald" />
        <StatCard icon={Send} label="Messages sent" value={totalMessages} accent="primary" />
        <StatCard icon={Users} label="Users reached" value={totalUsers} />
        <StatCard icon={MousePointerClick} label="Total triggers" value={totalTriggers} />
      </div>

      {/* Chart */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6">
        <h3 className="font-headline text-base font-extrabold text-on-surface mb-1">Messages sent by automation</h3>
        <p className="text-xs text-on-surface-variant mb-4">Top performing automations, by volume.</p>
        {chartData.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-12 text-center">No activity yet — simulate some below to see it here.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <Tooltip
                  cursor={{ fill: 'rgba(0, 88, 195, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#414754' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#414754' }} allowDecimals={false} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={index === 0 ? '#0058c3' : '#a6c1fe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Per-automation records */}
      <div>
        <h3 className="font-headline text-lg font-extrabold text-on-surface mb-1">Automation records</h3>
        <p className="text-xs text-on-surface-variant mb-4">Every automation you've launched, with its lifetime metrics.</p>
        {automations.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-8 text-center bg-surface-container-lowest border border-outline-variant/10 rounded-2xl">
            No automations yet — head to the AutoDM home page to create one.
          </p>
        ) : (
          <div className="space-y-2.5">
            {automations.map(a => {
              const Icon = sourceIcon(a.sourceType);
              return (
                <div key={a.id} className="flex items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {a.content ? (
                      <img src={a.content.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{a.name}</p>
                      <p className="text-xs text-on-surface-variant">{SOURCE_LABEL[a.sourceType]} · Updated {new Date(a.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                    <MiniStat label="Triggers" value={a.triggerCount} />
                    <MiniStat label="Messages" value={a.messagesSent} />
                    <MiniStat label="Users" value={a.uniqueUsers} />
                  </div>

                  <button
                    onClick={() => simulate(a.id)}
                    disabled={simulatingId === a.id}
                    className="px-3 py-2 bg-surface-container-highest text-primary text-xs font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center gap-1.5 flex-shrink-0"
                  >
                    {simulatingId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    Simulate
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent activity log */}
      <div>
        <h3 className="font-headline text-lg font-extrabold text-on-surface mb-1">Recent activity</h3>
        <p className="text-xs text-on-surface-variant mb-4">Individual triggers, most recent first.</p>
        {events.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-8 text-center bg-surface-container-lowest border border-outline-variant/10 rounded-2xl">
            Nothing logged yet.
          </p>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden">
            {events.map((e, idx) => (
              <div key={e.id} className={cn('flex items-center gap-3 p-3.5', idx !== events.length - 1 && 'border-b border-outline-variant/10')}>
                <img src={e.contactAvatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface">
                    <span className="font-bold">{e.contactName}</span> triggered <span className="font-bold">{e.autoDm.name}</span>
                  </p>
                  <p className="text-[10px] text-on-surface-variant truncate">"{e.triggerText}" · {e.messagesSent} message{e.messagesSent === 1 ? '' : 's'} sent</p>
                </div>
                <span className="text-[10px] text-on-surface-variant flex-shrink-0">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Send; label: string; value: number; accent?: 'primary' | 'emerald' }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 shadow-sm">
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center mb-3',
        accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' : accent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="font-headline text-2xl font-extrabold text-on-surface">{value.toLocaleString()}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold text-on-surface">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
    </div>
  );
}
