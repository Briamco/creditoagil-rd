'use client';

import type { RiskStatus } from '@/types';

interface RiskBadgeProps {
  status: RiskStatus;
}

export default function RiskBadge({ status }: RiskBadgeProps) {
  const styles: Record<RiskStatus, { label: string; className: string }> = {
    al_dia: {
      label: 'Al Día',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    },
    atraso_1_15: {
      label: '1-15 días atraso',
      className: 'bg-amber-50 text-amber-700 border border-amber-100',
    },
    moroso: {
      label: 'Moroso',
      className: 'bg-rose-50 text-rose-700 border border-rose-100',
    },
  };

  const current = styles[status] || { label: status, className: 'bg-slate-50 text-slate-600 border border-slate-100' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${current.className}`}>
      {current.label}
    </span>
  );
}
