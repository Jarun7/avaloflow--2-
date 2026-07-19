import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  X,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  ChevronDown,
  Image,
  Film,
  PlayCircle,
  Radio,
  Send,
  CheckCircle2,
  Pause,
  Play,
  Trash2,
  Sparkles,
  Settings as SettingsIcon,
  Zap,
  Unplug,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AutoDmWizard, SourceType } from '../components/autodm/AutoDmWizard';
import { ContentItem, ContentType, CONTENT_TYPE_LABEL, MOCK_POSTS_REELS, MOCK_STORIES, MOCK_LIVES } from '@/src/lib/autodmContent';

interface AutoDmRecord {
  id: string;
  name: string;
  channel: string;
  sourceType: SourceType;
  content: ContentItem | null;
  status: string;
  triggerCount: number;
  updatedAt: string;
}

interface Account {
  id: string;
  name: string;
  followers: string;
  image: string;
  platform: string;
}

const SOURCE_TABS: { value: SourceType; label: string; icon: typeof Image }[] = [
  { value: 'post_reel', label: 'Posts/Reels', icon: Image },
  { value: 'story', label: 'Stories', icon: PlayCircle },
  { value: 'live', label: 'IG Live', icon: Radio },
  { value: 'dm', label: 'DMs', icon: MessageCircle },
  { value: 'dm_post', label: 'DMs your post', icon: Send },
];

const SOURCE_CONTENT_MAP: Record<SourceType, ContentItem[]> = {
  post_reel: MOCK_POSTS_REELS,
  story: MOCK_STORIES,
  live: MOCK_LIVES,
  dm: [],
  dm_post: MOCK_POSTS_REELS,
};

const CONNECTION_PLATFORMS: { platform: string; label: string; icon: typeof Instagram; gradient: string }[] = [
  { platform: 'Instagram', label: 'Instagram', icon: Instagram, gradient: 'from-amber-400 via-pink-500 to-purple-600' },
  { platform: 'Facebook', label: 'Facebook', icon: Facebook, gradient: 'from-[#1877F2] to-[#0a58d0]' },
  { platform: 'YouTube', label: 'YouTube', icon: Youtube, gradient: 'from-[#FF0000] to-[#b30000]' },
];

function contentTypeIcon(type: ContentType) {
  if (type === 'reel') return Film;
  if (type === 'story') return PlayCircle;
  if (type === 'live') return Radio;
  return Image;
}

export function AutoDM() {
  const [mainTab, setMainTab] = useState<'automations' | 'settings'>('automations');
  const [sourceTab, setSourceTab] = useState<SourceType>('post_reel');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [automations, setAutomations] = useState<AutoDmRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardSourceType, setWizardSourceType] = useState<SourceType | null>(null);
  const [wizardContent, setWizardContent] = useState<ContentItem | null>(null);

  const account = accounts.find(a => a.platform === 'Instagram') || accounts[0];

  const loadAutomations = async () => {
    try {
      const res = await fetch('/api/autodm');
      const data = await res.json();
      setAutomations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load automations:', error);
    }
  };

  const loadAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    setAccounts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([loadAccounts(), loadAutomations()]);
      } catch (error) {
        console.error('Failed to load AutoDM data:', error);
        toast.error('Failed to load AutoDM data');
      } finally {
        setIsLoading(false);
      }
    };
    load();

    const params = new URLSearchParams(window.location.search);
    if (params.get('meta_connected')) {
      toast.success('Instagram account connected successfully');
      window.history.replaceState({}, '', window.location.pathname);
    }
    const metaError = params.get('meta_error');
    if (metaError) {
      toast.error(metaError);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const findAutomation = (sourceType: SourceType, contentId: string | null) =>
    automations.find(a => a.sourceType === sourceType && (a.content?.id || null) === contentId);

  const openGenericWizard = () => {
    setWizardSourceType(null);
    setWizardContent(null);
    setWizardOpen(true);
  };

  const openCardWizard = (source: SourceType, content: ContentItem | null) => {
    setWizardSourceType(source);
    setWizardContent(content);
    setWizardOpen(true);
  };

  const toggleStatus = async (automation: AutoDmRecord) => {
    const nextStatus = automation.status === 'active' ? 'paused' : 'active';
    try {
      await fetch(`/api/autodm/${automation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(nextStatus === 'active' ? 'Automation resumed' : 'Automation paused');
      loadAutomations();
    } catch (error) {
      toast.error('Failed to update automation');
    }
  };

  const deleteAutomation = async (automation: AutoDmRecord) => {
    try {
      await fetch(`/api/autodm/${automation.id}`, { method: 'DELETE' });
      toast.success('Automation deleted');
      loadAutomations();
    } catch (error) {
      toast.error('Failed to delete automation');
    }
  };

  const connectPlatform = async (platform: string) => {
    if (platform !== 'Instagram') {
      toast.error(`${platform} connections aren't supported yet`);
      return;
    }
    setConnectingPlatform(platform);
    try {
      const res = await fetch('/api/meta/status');
      const { configured } = await res.json();
      if (!configured) {
        toast.error('Meta app is not configured yet. Add META_APP_ID / META_APP_SECRET to the server .env file first.');
        return;
      }
      window.location.href = '/api/meta/connect';
    } catch (error) {
      toast.error(`Failed to connect ${platform}`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const disconnectPlatform = async (acc: Account) => {
    try {
      await fetch(`/api/accounts/${acc.id}`, { method: 'DELETE' });
      toast.success(`${acc.platform} disconnected`);
      await loadAccounts();
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  const contentList = SOURCE_CONTENT_MAP[sourceTab];
  const visibleContent = contentList.slice(0, visibleCount);

  const liveCount = automations.filter(a => a.status === 'active').length;
  const totalTriggers = automations.reduce((sum, a) => sum + (a.triggerCount || 0), 0);
  const connectedCount = accounts.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-purple-700 p-6 md:p-9 shadow-2xl shadow-primary/20"
      >
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Instant setup, zero code
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-white tracking-tight">AutoDM</h1>
            <p className="text-white/75 text-sm md:text-base mt-2 max-w-md">Turn comments, replies and DMs into conversations — automatically, in a couple of taps.</p>

            <button
              onClick={openGenericWizard}
              className="mt-6 flex items-center gap-2 px-5 py-3 bg-white text-primary text-sm font-bold rounded-xl hover:scale-[1.02] active:scale-95 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Create Automation
            </button>
          </div>

          <div className="flex gap-3">
            <StatChip label="Live now" value={liveCount} />
            <StatChip label="Total triggers" value={totalTriggers} />
            <StatChip label="Connected" value={connectedCount} />
          </div>
        </div>
      </motion.section>

      {/* Messenger banner */}
      <AnimatePresence>
        {!bannerDismissed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10 rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">New</span>
                  <p className="text-sm font-bold text-on-surface">Messenger automations are now live</p>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">Auto-reply to comments &amp; DMs on your Facebook Page — connect a Page to get started.</p>
              </div>
              <button
                onClick={() => setMainTab('settings')}
                className="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all flex-shrink-0"
              >
                Connect Facebook
              </button>
              <button onClick={() => setBannerDismissed(true)} className="p-1.5 hover:bg-primary/10 rounded-lg text-on-surface-variant transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-surface-container-low rounded-2xl">
        <button
          onClick={() => setMainTab('automations')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-all',
            mainTab === 'automations' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <Zap className="w-4 h-4" /> Automations
        </button>
        <button
          onClick={() => setMainTab('settings')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-all',
            mainTab === 'settings' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          <SettingsIcon className="w-4 h-4" /> Settings
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mainTab === 'automations' ? (
          <motion.div
            key="automations"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-lg font-extrabold text-on-surface">Jump right in and automate your Instagram</h2>
              {account && (
                <button className="flex items-center gap-2 px-3 py-2 border border-outline-variant/15 rounded-xl bg-white shadow-sm hover:bg-surface-container-low transition-all">
                  <Instagram className="w-4 h-4 text-primary" />
                  <img src={account.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-sm font-bold text-on-surface">{account.name}</span>
                  <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                </button>
              )}
            </div>

            {/* Source sub-tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {SOURCE_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => { setSourceTab(tab.value); setVisibleCount(4); }}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all',
                    sourceTab === tab.value
                      ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-md shadow-primary/20'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Content grid */}
            {sourceTab === 'dm' ? (
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent border border-primary/10 rounded-3xl p-8 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Automate replies to any Direct Message</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">Trigger a DM sequence whenever someone messages your account — with or without a keyword.</p>
                  </div>
                </div>
                {(() => {
                  const existing = findAutomation('dm', null);
                  if (existing) return <ActiveBadge />;
                  return (
                    <button
                      onClick={() => openCardWizard('dm', null)}
                      className="px-5 py-2.5 bg-on-surface text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all flex-shrink-0"
                    >
                      Setup automation
                    </button>
                  );
                })()}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {visibleContent.map((item, idx) => {
                    const Icon = contentTypeIcon(item.type);
                    const existing = findAutomation(sourceTab, item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="relative overflow-hidden">
                          <img src={item.thumbnail} alt="" className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                            <Icon className="w-2.5 h-2.5" />
                            {CONTENT_TYPE_LABEL[item.type]}
                          </div>
                          {existing && (
                            <div className="absolute top-2 right-2">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-bold text-on-surface line-clamp-2 leading-snug min-h-[2.5rem]">{item.caption}</p>
                          <p className="text-xs text-on-surface-variant mt-2">Posted on {item.date}</p>
                          {existing ? (
                            <div className="mt-3">
                              <ActiveBadge full />
                            </div>
                          ) : (
                            <button
                              onClick={() => openCardWizard(sourceTab, item)}
                              className="mt-3 w-full py-2.5 bg-gradient-to-r from-surface-container-highest to-surface-container-highest hover:from-primary hover:to-purple-600 hover:text-white text-on-surface font-bold text-xs rounded-xl transition-all"
                            >
                              Setup automation
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {visibleCount < contentList.length && (
                  <button
                    onClick={() => setVisibleCount(c => c + 4)}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    + View more
                  </button>
                )}
                {contentList.length === 0 && (
                  <p className="text-sm text-on-surface-variant py-8 text-center">No content available for this tab yet.</p>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-headline text-lg font-extrabold text-on-surface mb-1">Connections</h2>
              <p className="text-sm text-on-surface-variant mb-4">Link the accounts AutoDM should watch and reply from.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CONNECTION_PLATFORMS.map(p => {
                  const acc = accounts.find(a => a.platform === p.platform);
                  const isConnecting = connectingPlatform === p.platform;
                  return (
                    <div key={p.platform} className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-sm">
                      <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg', p.gradient)}>
                        <p.icon className="w-7 h-7 text-white" />
                      </div>
                      {acc ? (
                        <>
                          <div className="flex items-center gap-2">
                            <img src={acc.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <p className="text-sm font-bold text-on-surface">{acc.name}</p>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Connected · {acc.followers}
                          </span>
                          <button
                            onClick={() => disconnectPlatform(acc)}
                            className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-error transition-colors mt-1"
                          >
                            <Unplug className="w-3.5 h-3.5" /> Disconnect
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-on-surface">{p.label}</p>
                          <p className="text-xs text-on-surface-variant -mt-1.5">Not connected</p>
                          <button
                            onClick={() => connectPlatform(p.platform)}
                            disabled={isConnecting}
                            className="mt-1 w-full py-2 bg-on-surface text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
                          >
                            {isConnecting ? 'Connecting…' : 'Connect'}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-headline text-lg font-extrabold text-on-surface mb-1">Manage automations</h2>
              <p className="text-sm text-on-surface-variant mb-4">Pause, resume or remove anything you've launched.</p>
              {automations.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-8 text-center bg-surface-container-lowest border border-outline-variant/10 rounded-2xl">
                  No automations yet — create one from the Automations tab.
                </p>
              ) : (
                <div className="space-y-3">
                  {automations.map(a => (
                    <div key={a.id} className="flex items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {a.content ? (
                          <img src={a.content.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{a.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            {SOURCE_TABS.find(t => t.value === a.sourceType)?.label} · {a.triggerCount} triggers · Updated {new Date(a.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn(
                          'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full',
                          a.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-container-high text-on-surface-variant'
                        )}>
                          {a.status}
                        </span>
                        <button
                          onClick={() => toggleStatus(a)}
                          className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                          title={a.status === 'active' ? 'Pause' : 'Resume'}
                        >
                          {a.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteAutomation(a)}
                          className="p-2 hover:bg-error/10 hover:text-error rounded-lg text-on-surface-variant transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {account && (
        <AutoDmWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          accountHandle={account.name}
          accountAvatar={account.image}
          initialSourceType={wizardSourceType}
          initialContent={wizardContent}
          onLaunched={loadAutomations}
        />
      )}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[86px]">
      <p className="text-white font-headline text-xl font-extrabold">{value}</p>
      <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function ActiveBadge({ full }: { full?: boolean }) {
  return (
    <span className={cn(
      'flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-xl',
      full && 'w-full'
    )}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Active
    </span>
  );
}
