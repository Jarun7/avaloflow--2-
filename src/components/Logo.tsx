import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, iconClassName, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-5 h-5', text: 'text-sm' },
    md: { icon: 'w-6 h-6', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-3xl' },
  };

  const containerSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "primary-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 relative overflow-hidden",
        containerSizes[size],
        iconClassName
      )}>
        {/* Custom Unique Logo SVG */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={cn("fill-current", sizes[size].icon)}
        >
          <path 
            d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" 
            fill="currentColor" 
            fillOpacity="0.3"
          />
          <path 
            d="M12 18L5.21 21L12 2L18.79 21L12 18ZM12 15.5L15.5 17.1L12 7.8L8.5 17.1L12 15.5Z" 
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="2" fill="white" />
        </svg>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none"></div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={cn("font-bold text-on-surface font-headline tracking-tighter leading-none", sizes[size].text)}>
            Avaloflow
          </h1>
          {size !== 'sm' && (
            <p className="text-[9px] uppercase tracking-[0.2em] text-on-surface-variant font-black mt-1 opacity-70">
              Marketing OS
            </p>
          )}
        </div>
      )}
    </div>
  );
}
