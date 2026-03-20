import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-12">
        <div className="relative inline-block">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-[12rem] md:text-[16rem] font-headline font-black text-surface-container-high leading-none select-none"
          >
            404
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-12">
              <Search className="w-10 h-10 md:w-16 md:h-16" />
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">Page not found</h1>
          <p className="text-lg text-on-surface-variant max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-surface-container-low text-on-surface font-bold rounded-2xl hover:bg-surface-container-high transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <Link 
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-on-primary-fixed-variant text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            { label: 'Need help?', to: '/support', desc: 'Contact our support team' },
            { label: 'Dashboard', to: '/', desc: 'View your live metrics' },
            { label: 'Settings', to: '/settings', desc: 'Manage your account' },
          ].map((link, idx) => (
            <Link 
              key={idx}
              to={link.to}
              className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group"
            >
              <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{link.label}</p>
              <p className="text-xs text-on-surface-variant mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
