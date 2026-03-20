import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  type = 'default',
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const icons = {
    success: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    error: <AlertCircle className="w-6 h-6 text-error" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    info: <Info className="w-6 h-6 text-primary" />,
    default: null
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/10"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {icons[type]}
                  <div>
                    <h3 className="text-xl font-bold text-on-surface font-headline">{title}</h3>
                    {description && <p className="text-sm text-on-surface-variant mt-1">{description}</p>}
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {children}
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all"
                >
                  {cancelLabel}
                </button>
                {confirmLabel && (
                  <button 
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={cn(
                      "px-6 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                      type === 'error' ? "bg-error shadow-error/20" : "bg-on-primary-fixed-variant shadow-primary/20"
                    )}
                  >
                    {isLoading ? 'Processing...' : confirmLabel}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
