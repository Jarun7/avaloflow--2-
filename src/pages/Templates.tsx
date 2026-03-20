import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Search, 
  Filter, 
  Plus, 
  Star, 
  Clock, 
  Zap, 
  Mail, 
  ShoppingCart, 
  UserPlus, 
  MessageSquare,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { Modal } from '@/src/components/Modal';

interface Template {
  id: string;
  name: string;
  desc: string;
  category: string;
  rating: number;
  usage: number;
  icon: string;
  color: string;
}

const iconMap: Record<string, any> = {
  Mail,
  ShoppingCart,
  MessageSquare,
  Zap,
  UserPlus,
  Layout
};

const CATEGORIES = ['Onboarding', 'Sales', 'Retention', 'Growth', 'Content'];
const ICONS = ['Mail', 'ShoppingCart', 'MessageSquare', 'Zap', 'UserPlus', 'Layout'];

export function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', desc: '', category: 'Onboarding', icon: 'Zap' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.desc.trim()) {
      toast.error('Name and description are required');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Failed to create template');
      const newTemplate = await response.json();
      setTemplates(prev => [newTemplate, ...prev]);
      setShowCreateModal(false);
      setForm({ name: '', desc: '', category: 'Onboarding', icon: 'Zap' });
      toast.success('Template created successfully');
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
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
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Flow Templates</h1>
          <p className="text-on-surface-variant mt-1">Jumpstart your automation with pre-built, high-converting flows.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-low text-on-primary-fixed-variant border border-outline-variant/10 rounded-xl font-bold shadow-lg shadow-primary/5 hover:bg-surface-container-high transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          Create Custom Template
        </button>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
          {['All', 'Onboarding', 'Sales', 'Retention', 'Growth', 'Content'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                cat === activeCategory
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Premium Template */}
        <div 
          onClick={() => window.location.href = '/automations/premium-follower-check'}
          className="bg-surface-container-lowest p-6 rounded-2xl no-line-card border-2 border-primary/50 group hover:border-primary transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden shadow-xl shadow-primary/10"
        >
          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Premium
          </div>
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-primary text-white">
                <MessageSquare className="w-6 h-6 fill-current" />
              </div>
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">Comment to DM Follower Check</h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Reply to a comment (e.g., "brownie"), ask if they follow, verify follower status, and deliver content. Includes polls and conditional logic.
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                <Clock className="w-3 h-3" />
                4,200 uses
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Growth
              </span>
            </div>
            <button className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredTemplates.map((template) => {
          const IconComponent = iconMap[template.icon] || Layout;
          return (
            <div 
              key={template.id}
              className="bg-surface-container-lowest p-6 rounded-2xl no-line-card border border-outline-variant/10 group hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-primary text-white")}>
                    <IconComponent className="w-6 h-6 fill-current" />
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {template.rating}
                  </div>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{template.name}</h3>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{template.desc}</p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                    <Clock className="w-3 h-3" />
                    {template.usage} uses
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {template.category}
                  </span>
                </div>
                <button className="p-2 bg-surface-container-low rounded-lg text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Template Section */}
      <div className="bg-on-primary-fixed-variant p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 bg-white/10 text-white/90 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 mb-6">
            <Star className="w-3.5 h-3.5 fill-current" />
            Featured Template
          </div>
          <h2 className="text-white font-headline text-3xl md:text-4xl font-extrabold tracking-tight">AI-Powered Smart Segmentation</h2>
          <p className="text-white/80 mt-4 text-lg leading-relaxed">
            Automatically group your audience based on behavioral patterns and engagement scores using our latest machine learning model.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <button className="w-full sm:w-auto px-8 py-3 bg-white text-on-primary-fixed-variant rounded-xl font-bold hover:bg-surface-container-low transition-all active:scale-95">
              Use Template
            </button>
            <button className="w-full sm:w-auto px-8 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all backdrop-blur-md">
              Learn More
            </button>
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
        <div className="absolute right-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px]"></div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setForm({ name: '', desc: '', category: 'Onboarding', icon: 'Zap' }); }}
        title="Create Custom Template"
        description="Define a reusable template for your automation flows."
        confirmLabel="Create Template"
        onConfirm={handleCreate}
        isLoading={isSaving}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Template Name <span className="text-error">*</span></label>
            <input
              type="text"
              placeholder="e.g. Welcome Email Series"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Description <span className="text-error">*</span></label>
            <textarea
              rows={3}
              placeholder="Describe what this template does..."
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Icon</label>
              <select
                value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              >
                {ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
