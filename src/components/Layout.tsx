import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-surface-container-low z-[70] lg:hidden shadow-2xl"
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          "lg:ml-0" // Sidebar is handled by flex-shrink-0 above
        )}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-4 md:p-8 max-w-[1600px] mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
