'use client';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

export function SidePanelHeader({ children, subtitle, onClose }: { children: React.ReactNode; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-200/40 pb-3 relative z-10">
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{children}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="w-6 h-6 rounded-full glass-card-static border border-slate-200/30 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-xs cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

export function SidePanelBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-6 relative z-10 ${className}`}>{children}</div>;
}

export default function SidePanel({ open, onClose, position = 'right', className = '', children }: SidePanelProps) {
  if (!open) return null;

  return (
    <div
      className={`${
        position === 'right'
          ? 'animate-slide-in-right'
          : 'animate-slide-in-left'
      } glass-card-static p-6 space-y-6 sticky top-6 relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      {children}
    </div>
  );
}
