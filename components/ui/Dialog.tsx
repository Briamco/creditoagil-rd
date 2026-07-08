'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  size?: DialogSize;
  children: React.ReactNode;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function DialogHeader({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200/40 pb-4 mb-6">
      <h2 className="text-base font-bold text-slate-800 font-[var(--font-heading)]">
        {children}
      </h2>
      <button
        onClick={onClose}
        className="w-6 h-6 rounded-full glass-card-static border border-slate-200/30 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-xs cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

export function DialogBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-slate-200/40 pt-6 mt-8">
      {children}
    </div>
  );
}

export default function Dialog({ open, onClose, size = 'md', children }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`glass-card-static w-full ${sizeClasses[size]} p-6 animate-fade-in-scale max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
