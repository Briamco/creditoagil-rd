'use client';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  trend: 'up' | 'down';
  accentColor?: 'teal' | 'amber' | 'violet' | 'blue' | 'rose';
}

const accentBorders: Record<string, string> = {
  teal: 'from-blue-500 to-blue-600',
  amber: 'from-amber-500 to-amber-600',
  violet: 'from-emerald-500 to-emerald-600',
  blue: 'from-indigo-500 to-indigo-600',
  rose: 'from-rose-500 to-rose-600',
};

const glowColors: Record<string, string> = {
  teal: 'bg-blue-500/5 group-hover:bg-blue-500/10',
  amber: 'bg-amber-500/5 group-hover:bg-amber-500/10',
  violet: 'bg-emerald-500/5 group-hover:bg-emerald-500/10',
  blue: 'bg-indigo-500/5 group-hover:bg-indigo-500/10',
  rose: 'bg-rose-500/5 group-hover:bg-rose-500/10',
};

function renderSVGIcon(title: string, accent: string) {
  const t = title.toLowerCase();
  
  const iconColors: Record<string, string> = {
    teal: 'text-blue-600',
    blue: 'text-indigo-600',
    rose: 'text-rose-600',
    violet: 'text-emerald-600',
    amber: 'text-amber-600',
  };
  
  const colorClass = iconColors[accent] || 'text-blue-600';
  
  if (t.includes('desembolsado') || t.includes('capital')) {
    return (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (t.includes('interes') || t.includes('acumulados')) {
    return (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  }
  if (t.includes('morosidad') || t.includes('tasa')) {
    return (
      <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  return (
    <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

export default function MetricCard({ title, value, change, icon, trend, accentColor = 'teal' }: MetricCardProps) {
  return (
    <div
      className="
        glass-card-solid group cursor-default relative
        transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.08),0_6px_14px_-4px_rgba(15,23,42,0.04)]
      "
    >
      {/* Background Radial Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${glowColors[accentColor]}`} />

      {/* Gradient Top Border */}
      <div className={`h-0.5 bg-gradient-to-r ${accentBorders[accentColor]}`} />

      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
            <p className="text-2xl font-extrabold text-slate-800 font-[var(--font-heading)] tracking-tight">
              {value}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}>
                {trend === 'up' ? '↑' : '↓'} {change}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">vs mes anterior</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 transition-transform duration-300 group-hover:scale-110">
            {renderSVGIcon(title, accentColor)}
          </div>
        </div>
      </div>
    </div>
  );
}
