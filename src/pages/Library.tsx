import React, { useEffect, useState } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2,
  Grid,
  List,
  Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface Asset {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  url: string;
}

export function Library() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/library');
        if (!response.ok) throw new Error('Failed to fetch library assets');
        const data = await response.json();
        setAssets(data);
      } catch (error) {
        console.error('Error fetching library assets:', error);
        toast.error('Failed to load library assets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Asset Library</h1>
          <p className="text-on-surface-variant mt-1">Centralized storage for all your marketing media and documents.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-on-primary-fixed-variant text-white rounded-xl font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          Upload New Asset
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full bg-white border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-white p-1 rounded-xl border border-outline-variant/10">
            <button className="p-1.5 bg-surface-container-high text-primary rounded-lg">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all">
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-outline-variant/10 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div 
            key={asset.id}
            className="bg-surface-container-lowest rounded-2xl no-line-card border border-outline-variant/10 overflow-hidden group hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="relative aspect-video bg-surface-container-low overflow-hidden">
              <img 
                src={asset.url} 
                alt={asset.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                {asset.type === 'image' && <ImageIcon className="w-3 h-3" />}
                {asset.type === 'video' && <Video className="w-3 h-3" />}
                {asset.type === 'document' && <FileText className="w-3 h-3" />}
                {asset.type}
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white rounded-full text-on-surface hover:bg-primary hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white rounded-full text-on-surface hover:bg-primary hover:text-white transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">{asset.name}</h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">{asset.size} • {new Date(asset.date).toLocaleDateString()}</p>
              </div>
              <button className="p-1.5 hover:bg-surface-container-low rounded-lg text-on-surface-variant hover:text-on-surface transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Storage Usage Section */}
      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-on-surface">Storage Usage</h4>
              <span className="text-xs font-bold text-on-surface-variant">1.2 GB of 5 GB used</span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-white border border-outline-variant/10 rounded-xl text-sm font-bold text-primary hover:bg-surface-container-high transition-all whitespace-nowrap">
            Upgrade Storage
          </button>
        </div>
      </div>
    </div>
  );
}
