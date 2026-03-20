import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  Rocket, 
  Users, 
  Zap, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Plus,
  X,
  FileText,
  Activity as ActivityIcon,
  Layers,
  Library as LibraryIcon,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Rocket, label: 'Campaigns', to: '/campaigns' },
  { icon: Users, label: 'Audiences', to: '/audiences' },
  { icon: Zap, label: 'Automations', to: '/automations' },
  { icon: BarChart3, label: 'Analytics', to: '/analytics' },
  { icon: FileText, label: 'Reports', to: '/reports' },
  { icon: ActivityIcon, label: 'Activity', to: '/activity' },
  { icon: Layers, label: 'Templates', to: '/templates' },
  { icon: LibraryIcon, label: 'Library', to: '/library' },
];

const footerItems = [
  { icon: CreditCard, label: 'Billing', to: '/billing' },
  { icon: Settings, label: 'Settings', to: '/settings' },
  { icon: HelpCircle, label: 'Support', to: '/support' },
];

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ onClose, isMobile }: SidebarProps) {
  return (
    <aside className={cn(
      "h-screen flex flex-col bg-surface-container-low border-r border-outline-variant/10 z-50",
      isMobile ? "w-full" : "w-64 fixed left-0 top-0"
    )}>
      <div className="flex flex-col h-full p-4 gap-y-2">
        {/* Header Brand */}
        <div className="px-3 py-6 mb-4 flex items-center justify-between">
          <Logo />
          {isMobile && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                isActive 
                  ? "bg-surface-container-highest text-primary font-bold" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <item.icon className={cn("w-5 h-5", item.to === '/' ? "fill-current" : "")} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <button className="mt-4 primary-gradient text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-sm">
          <Plus className="w-5 h-5" />
          New Automation
        </button>

        {/* Footer Navigation */}
        <div className="mt-auto pt-4 border-t border-outline-variant/10 space-y-1">
          {footerItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                isActive 
                  ? "bg-surface-container-highest text-primary font-bold" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
