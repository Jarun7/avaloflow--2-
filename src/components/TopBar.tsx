import React from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const navLinks = [
  { label: 'Overview', to: '/' },
  { label: 'Reports', to: '/reports' },
  { label: 'Activity', to: '/activity' },
  { label: 'Flows', to: '/campaigns' },
  { label: 'Templates', to: '/templates' },
  { label: 'Library', to: '/library' },
];

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  
  // Determine which links to show based on current path
  const isCampaigns = location.pathname.startsWith('/campaigns');
  const isAudiences = location.pathname.startsWith('/audiences');
  const isAutomations = location.pathname.startsWith('/automations');
  
  const linksToShow = (isCampaigns || isAudiences || isAutomations) 
    ? navLinks.slice(3) 
    : navLinks.slice(0, 3);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 glass-header border-b border-outline-variant/10 z-40 flex justify-between items-center px-4 md:px-8 transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            className="bg-surface-container-low border-none rounded-full py-1.5 pl-10 pr-4 w-48 md:w-64 text-sm focus:ring-2 focus:ring-primary/20 transition-all" 
            placeholder="Search data..." 
            type="text"
          />
        </div>

        {/* Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 h-full">
          {linksToShow.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                "text-sm font-semibold transition-all h-full flex items-center border-b-2",
                isActive 
                  ? "text-primary border-primary" 
                  : "text-on-surface-variant border-transparent hover:text-primary"
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
          <Bell className="w-5 h-5" />
        </button>
        <button 
          onClick={() => toast.success('Campaign launched successfully!', {
            description: 'Your audience will start receiving messages shortly.',
          })}
          className="hidden sm:block bg-on-primary-fixed-variant text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
        >
          Launch
        </button>
        <div className="h-8 w-[1px] bg-outline-variant/30 mx-1 md:mx-2"></div>
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group">
          <img 
            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all" 
            src="https://picsum.photos/seed/user1/100/100" 
            alt="User"
          />
          <ChevronDown className="w-4 h-4 text-on-surface-variant hidden xs:block" />
        </div>
      </div>
    </header>
  );
}
