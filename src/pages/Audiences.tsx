import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Edit, 
  Mail, 
  CheckCircle2, 
  ShoppingCart, 
  MousePointer2,
  StickyNote,
  Plus,
  MoreVertical,
  Loader2,
  Zap,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface AudienceHistory {
  id: string;
  icon: string;
  title: string;
  time: string;
  desc: string;
  details?: string[];
  color: string;
}

interface AudienceNote {
  id: string;
  text: string;
  author: string;
  updatedAt: string;
}

interface Audience {
  id: string;
  name: string;
  email: string;
  tag: string;
  status: string;
  image: string;
  location: string;
  joinedDate: string;
  engagementScore: number;
  ltv: number;
  openRate: number;
  eventsCount: number;
  bio: string;
  history: AudienceHistory[];
  notes: AudienceNote[];
  tags: string[];
}

const iconMap: Record<string, any> = {
  ShoppingCart,
  Mail,
  MousePointer2,
  CheckCircle2,
  Plus,
  Zap,
  TrendingUp,
  MessageSquare
};

export function Audiences() {
  const [contacts, setContacts] = useState<Audience[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);

  useEffect(() => {
    const fetchAudiences = async () => {
      try {
        const response = await fetch('/api/audiences');
        if (!response.ok) throw new Error('Failed to fetch audiences');
        const data = await response.json();
        setContacts(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching audiences:', error);
        toast.error('Failed to load audience data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudiences();
  }, []);

  const handleContactClick = (id: string) => {
    setSelectedId(id);
    setShowDetailOnMobile(true);
  };

  const selectedContact = contacts.find(c => c.id === selectedId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex -m-4 md:-m-8 h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* Column 1: Contact List */}
      <section className={cn(
        "w-full lg:w-[400px] flex flex-col bg-surface-container-low border-r border-outline-variant/10 transition-all duration-300",
        showDetailOnMobile ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 md:p-6 pb-2">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface tracking-tight">Audiences</h2>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">{contacts.length.toLocaleString()} Contacts</span>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {['All', 'Active', 'Leads', 'VIPs'].map((filter, i) => (
              <button 
                key={filter}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  i === 0 ? "bg-primary text-white" : "bg-white text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-2 md:px-4 space-y-1 pb-8">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => handleContactClick(contact.id)}
              className={cn(
                "p-3 md:p-4 rounded-2xl flex items-center gap-3 md:gap-4 cursor-pointer transition-all",
                selectedId === contact.id 
                  ? "bg-surface-container-highest shadow-sm" 
                  : "hover:bg-white/50"
              )}
            >
              <div className="relative flex-shrink-0">
                <img 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" 
                  src={contact.image} 
                  alt={contact.name}
                />
                {contact.status === 'online' && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 h-3 bg-primary border-2 border-surface-container-highest rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-on-surface truncate text-sm">{contact.name}</h3>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    contact.tag === 'VIP' ? "text-primary" : "text-on-surface-variant/40"
                  )}>
                    {contact.tag}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant truncate">{contact.email}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Column 2: Detailed Profile View */}
      <section className={cn(
        "flex-1 bg-white overflow-y-auto transition-all duration-300",
        showDetailOnMobile ? "block" : "hidden lg:block"
      )}>
        {/* Mobile Back Button */}
        <div className="lg:hidden p-4 border-b border-outline-variant/10 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <button 
            onClick={() => setShowDetailOnMobile(false)}
            className="flex items-center gap-2 text-primary font-bold text-sm"
          >
            <Plus className="w-4 h-4 rotate-45" />
            Back to List
          </button>
        </div>

        {selectedContact ? (
          <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 md:space-y-12">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 pb-8 md:pb-10 border-b border-outline-variant/10">
              <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-center">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
                    <img 
                      className="w-full h-full object-cover" 
                      src={selectedContact.image} 
                      alt={selectedContact.name}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-primary fill-current" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl md:text-4xl font-headline font-extrabold text-on-surface tracking-tight">{selectedContact.name}</h1>
                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">{selectedContact.tag} Member</span>
                  </div>
                  <p className="text-base md:text-lg text-on-surface-variant">{selectedContact.bio}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-medium text-on-surface-variant/60 pt-2">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedContact.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {new Date(selectedContact.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/30 font-bold text-on-surface hover:bg-surface-container transition-colors text-sm">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/20 transition-all text-sm">
                  <Mail className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>

            {/* Bento Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="p-5 md:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Engagement Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl md:text-4xl font-headline font-extrabold text-primary">{selectedContact.engagementScore}</span>
                  <span className="text-xs font-bold text-primary mb-1.5">/100</span>
                </div>
                <div className="w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${selectedContact.engagementScore}%` }}></div>
                </div>
              </div>
              <div className="p-5 md:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Total LTV</p>
                <div className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface">${selectedContact.ltv.toLocaleString()}</div>
                <p className="text-xs font-bold text-primary">+12% from last month</p>
              </div>
              <div className="p-5 md:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Email Open Rate</p>
                <div className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface">{selectedContact.openRate}%</div>
                <p className="text-xs font-bold text-on-surface-variant/60">Benchmark: 22%</p>
              </div>
              <div className="p-5 md:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Recent Activity</p>
                <div className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface">{selectedContact.eventsCount}</div>
                <p className="text-xs font-bold text-on-surface-variant/60">Events this week</p>
              </div>
            </div>

            {/* History & Details Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
              {/* History */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-xl font-headline font-extrabold text-on-surface mb-6">Engagement History</h3>
                  <div className="space-y-6 relative before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-px before:bg-outline-variant/30">
                    {selectedContact.history.map((item, idx) => {
                      const Icon = iconMap[item.icon] || Mail;
                      return (
                        <div key={idx} className="relative pl-12">
                          <div className={cn("absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white z-10", item.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="p-4 md:p-5 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1 gap-1">
                              <h4 className="font-bold text-on-surface text-sm">{item.title}</h4>
                              <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase">{new Date(item.time).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-on-surface-variant mb-3">{item.desc}</p>
                            {item.details && Array.isArray(item.details) && (
                              <div className="flex flex-wrap items-center gap-2">
                                {item.details.map((detail, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white rounded-md text-[10px] font-bold border border-outline-variant/20">{detail}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar Details */}
              <div className="space-y-10">
                {/* Tags Section */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Active Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedContact.tags) ? selectedContact.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-surface-container-high text-on-primary-fixed-variant rounded-lg text-[10px] font-bold">{tag}</span>
                    )) : null}
                    <button className="px-3 py-1.5 border border-dashed border-outline-variant rounded-lg text-[10px] font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-colors">+ Add Tag</button>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Internal Notes</h3>
                  {selectedContact.notes.map((note) => (
                    <div key={note.id} className="bg-tertiary-fixed p-5 rounded-2xl relative overflow-hidden group mb-4 last:mb-0">
                      <StickyNote className="absolute top-[-10px] right-[-10px] w-16 h-16 text-tertiary/10 rotate-12" />
                      <p className="text-sm text-on-tertiary-fixed leading-relaxed relative z-10">
                        {note.text}
                      </p>
                      <div className="mt-4 flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-bold text-on-tertiary-fixed-variant opacity-60">Last updated by {note.author}</span>
                        <button className="text-[10px] font-bold text-on-tertiary-fixed-variant underline">Edit</button>
                      </div>
                    </div>
                  ))}
                  {selectedContact.notes.length === 0 && (
                    <p className="text-xs text-on-surface-variant italic">No internal notes for this contact.</p>
                  )}
                </div>

                {/* Connected Sources */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Connected Sources</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/15 bg-white">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">S</div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Salesforce CRM</p>
                        <p className="text-[8px] text-on-surface-variant font-bold">Last synced 5m ago</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/15 bg-white opacity-60">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-xs">H</div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-on-surface uppercase tracking-wider">HubSpot</p>
                        <p className="text-[8px] text-on-surface-variant font-bold">Inactive</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-on-surface-variant">
            Select a contact to view details
          </div>
        )}
      </section>
    </div>
  );
}
