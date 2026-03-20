import React, { useState, useEffect } from 'react';
import { 
  Link, 
  RefreshCw, 
  LogOut, 
  X, 
  Zap, 
  Timer, 
  ArrowRight,
  Loader2,
  Plus
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { Modal } from '@/src/components/Modal';

interface Account {
  id: string;
  name: string;
  followers: string;
  status: string;
  image: string;
  platform: string;
}

interface Keyword {
  id: string;
  text: string;
}

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
}

export function Settings() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  
  // Modal states
  const [deleteKeywordId, setDeleteKeywordId] = useState<string | null>(null);
  const [disconnectAccountId, setDisconnectAccountId] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setIsLoading(true);
      const [accountsRes, keywordsRes, settingsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/keywords'),
        fetch('/api/settings')
      ]);

      if (!accountsRes.ok || !keywordsRes.ok || !settingsRes.ok) {
        throw new Error('Failed to fetch settings data');
      }

      const [accountsData, keywordsData, settingsData] = await Promise.all([
        accountsRes.json(),
        keywordsRes.json(),
        settingsRes.json()
      ]);

      setAccounts(accountsData);
      setKeywords(keywordsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const getSettingValue = (key: string, defaultValue: any) => {
    const setting = settings.find(s => s.key === key);
    if (!setting) return defaultValue;
    if (setting.type === 'boolean') return setting.value === 'true';
    if (setting.type === 'number') return Number(setting.value);
    return setting.value;
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => prev.map(s => {
      if (s.key === key) {
        return { ...s, value: s.value === 'true' ? 'false' : 'true' };
      }
      return s;
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    try {
      setIsAddingKeyword(true);
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newKeyword.trim() })
      });

      if (!response.ok) throw new Error('Failed to add keyword');
      
      const keyword = await response.json();
      setKeywords(prev => [...prev, keyword]);
      setNewKeyword('');
      toast.success('Keyword added');
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast.error('Failed to add keyword');
    } finally {
      setIsAddingKeyword(false);
    }
  };

  const handleDeleteKeyword = async () => {
    if (!deleteKeywordId) return;

    try {
      const response = await fetch(`/api/keywords/${deleteKeywordId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete keyword');
      
      setKeywords(prev => prev.filter(k => k.id !== deleteKeywordId));
      toast.success('Keyword removed');
    } catch (error) {
      console.error('Error deleting keyword:', error);
      toast.error('Failed to remove keyword');
    } finally {
      setDeleteKeywordId(null);
    }
  };

  const handleDisconnectAccount = async () => {
    if (!disconnectAccountId) return;
    try {
      const response = await fetch(`/api/accounts/${disconnectAccountId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete account');
      setAccounts(prev => prev.filter(a => a.id !== disconnectAccountId));
      toast.success('Account disconnected');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to disconnect account');
    } finally {
      setDisconnectAccountId(null);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    try {
      setIsSubmittingAccount(true);
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccountName.trim(),
          followers: '0',
          status: 'Active',
          image: `https://picsum.photos/seed/${newAccountName.trim()}/100/100`,
          platform: 'Instagram'
        })
      });

      if (!response.ok) throw new Error('Failed to add account');
      
      const account = await response.json();
      setAccounts(prev => [...prev, account]);
      setNewAccountName('');
      setIsAddingAccount(false);
      toast.success('Account connected successfully');
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('Failed to connect account');
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Instagram Settings</h1>
        <p className="text-on-surface-variant font-body">Manage your Instagram accounts, global keyword responses, and automation behavior.</p>
      </div>

      {/* Bento Layout for Settings */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Settings */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Account Connection Card */}
          <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl no-line-card border border-outline-variant/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface">Connected Accounts</h3>
                <p className="text-on-surface-variant text-sm mt-1">Manage the Instagram profiles linked to Avaloflow.</p>
              </div>
              <button 
                onClick={() => setIsAddingAccount(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-container-high text-on-primary-fixed-variant font-bold rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 text-sm"
              >
                <Link className="w-4 h-4" />
                Connect New
              </button>
            </div>

            <div className="space-y-4">
              {accounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl group transition-all hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white" 
                        src={account.image} 
                        alt={account.name}
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-[8px] font-black uppercase">{account.platform === 'Instagram' ? 'IG' : 'FB'}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{account.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          account.status === 'Active' ? "bg-primary" : "bg-surface-dim"
                        )}></span>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{account.status} • {account.followers} Followers</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDisconnectAccountId(account.id)}
                      className="p-2 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {accounts.length === 0 && (
                <div className="text-center py-8 bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/30">
                  <p className="text-sm text-on-surface-variant">No accounts connected yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Global Keywords Card */}
          <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl no-line-card border border-outline-variant/10">
            <div className="mb-6">
              <h3 className="font-headline text-xl font-bold text-on-surface">Global Keywords</h3>
              <p className="text-on-surface-variant text-sm mt-1">Define keywords that trigger specific automation flows across all accounts.</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {keywords.map((kw) => (
                <span key={kw.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] font-black uppercase tracking-widest">
                  {kw.text} 
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-error transition-colors" 
                    onClick={() => setDeleteKeywordId(kw.id)}
                  />
                </span>
              ))}
              <form onSubmit={handleAddKeyword} className="flex items-center gap-2">
                <input 
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="New keyword..."
                  className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-full text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary w-32"
                />
                <button 
                  type="submit"
                  disabled={isAddingKeyword || !newKeyword.trim()}
                  className="p-1.5 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {isAddingKeyword ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Zap className="w-4 h-4 text-primary fill-current" />
                  </div>
                  <span className="font-bold text-sm text-on-surface">Default Flow</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Triggered when any global keyword is detected in comments or DMs.</p>
                <button className="w-full py-2.5 bg-white text-on-surface font-bold text-[10px] uppercase tracking-widest rounded-xl border border-outline-variant/30 hover:shadow-sm transition-all">Configure Logic</button>
              </div>
              
              <div className="p-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Timer className="w-4 h-4 text-tertiary fill-current" />
                  </div>
                  <span className="font-bold text-sm text-on-surface">Smart Delay</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">Add a 5-10 minute natural delay to keyword responses for authenticity.</p>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    getSettingValue('smart_delay', false) ? "text-primary" : "text-on-surface-variant/40"
                  )}>
                    {getSettingValue('smart_delay', false) ? 'ENABLED' : 'DISABLED'}
                  </span>
                  <div 
                    onClick={() => toggleSetting('smart_delay')}
                    className={cn(
                      "w-8 h-4 rounded-full relative cursor-pointer transition-colors",
                      getSettingValue('smart_delay', false) ? "bg-primary" : "bg-surface-dim"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                      getSettingValue('smart_delay', false) ? "right-0.5" : "left-0.5"
                    )}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Secondary Configs */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Automation Rules */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl no-line-card border border-outline-variant/10">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6">Automation Rules</h3>
            <div className="space-y-6">
              {[
                { key: 'auto_comment_like', title: 'Auto-Comment Like', desc: 'Automatically like comments before replying.' },
                { key: 'ai_tone_matching', title: 'AI Tone Matching', desc: 'Adjust response tone based on account bio.' },
                { key: 'spam_protection', title: 'Spam Protection', desc: 'Ignore repetitive comments from same users.' },
              ].map((rule, i) => {
                const isActive = getSettingValue(rule.key, false);
                return (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-on-surface">{rule.title}</h5>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{rule.desc}</p>
                    </div>
                    <div 
                      onClick={() => toggleSetting(rule.key)}
                      className={cn(
                        "w-10 h-5 rounded-full relative cursor-pointer mt-1 transition-colors",
                        isActive ? "bg-primary" : "bg-surface-dim"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                        isActive ? "right-0.5" : "left-0.5"
                      )}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant/10">
              <h5 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Daily Limits</h5>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wider">
                    <span className="text-on-surface-variant">Total Replies</span>
                    <span className="text-on-surface">452 / 1000</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="w-[45%] h-full bg-primary"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wider">
                    <span className="text-on-surface-variant">New Connections</span>
                    <span className="text-on-surface">12 / 50</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="w-[24%] h-full bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Sync Information */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-on-surface to-[#0d1c2e] text-white shadow-xl shadow-on-surface/20">
            <div className="relative z-10">
              <RefreshCw className="w-8 h-8 text-primary-fixed-dim mb-4" />
              <h4 className="font-headline font-bold text-lg mb-2">Real-time Syncing</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">Your Instagram data is updated every 15 minutes to ensure no lead is missed.</p>
              <button className="text-[10px] font-black text-primary-fixed-dim hover:underline flex items-center gap-1 uppercase tracking-widest">
                Learn about API limits <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {/* Abstract decorative background shape */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Sticky Save Actions */}
      <div className="mt-12 sticky bottom-4 md:bottom-8 flex justify-end z-30">
        <div className="bg-white/80 backdrop-blur-md p-1.5 md:p-2 rounded-2xl shadow-2xl shadow-black/10 flex items-center gap-2 md:gap-4 border border-outline-variant/10 w-full sm:w-auto">
          <button 
            onClick={() => fetchSettingsData()}
            className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 text-on-surface-variant font-bold text-[10px] md:text-xs uppercase tracking-widest hover:text-on-surface transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 md:px-8 py-2.5 primary-gradient text-white font-bold text-[10px] md:text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={deleteKeywordId !== null}
        onClose={() => setDeleteKeywordId(null)}
        title="Delete Keyword"
        description="Are you sure you want to remove this global keyword? This will stop all automations triggered by it."
        type="warning"
        confirmLabel="Delete"
        onConfirm={handleDeleteKeyword}
      />

      <Modal
        isOpen={disconnectAccountId !== null}
        onClose={() => setDisconnectAccountId(null)}
        title="Disconnect Account"
        description="Are you sure you want to disconnect this Instagram account? You will lose access to its real-time data and automations."
        type="error"
        confirmLabel="Disconnect"
        onConfirm={handleDisconnectAccount}
      />

      {isAddingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-outline-variant/20">
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Connect Instagram Account</h3>
            <p className="text-sm text-on-surface-variant mb-6">Enter the username of the Instagram account you want to connect.</p>
            
            <form onSubmit={handleAddAccount}>
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Instagram Username</label>
                <input 
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddingAccount(false)}
                  className="flex-1 py-3 text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:bg-surface-container-low rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingAccount || !newAccountName.trim()}
                  className="flex-1 py-3 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
