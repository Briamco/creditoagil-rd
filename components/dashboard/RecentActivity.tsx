'use client';

import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';

export default function RecentActivity() {
  const { state } = useLoanSystem();
  const { cashTransactions } = state;

  // Ordenar por fecha descendente y tomar los últimos 10
  const recentTransactions = [...cashTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getTransactionTypeStyle = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      case 'expense':
        return 'text-rose-700 bg-rose-50 border border-rose-100';
      case 'deposit':
        return 'text-blue-700 bg-blue-50 border border-blue-100';
      default:
        return 'text-slate-600 bg-slate-50 border border-slate-100';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'income':
        return 'Ingreso';
      case 'expense':
        return 'Gasto';
      case 'deposit':
        return 'Depósito';
      default:
        return type;
    }
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden animate-fade-in border border-slate-100 bg-white">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 font-[var(--font-heading)] relative z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Actividad Reciente de Caja
      </h3>

      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Descripción</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Procesado Por</th>
              <th className="py-3 px-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic text-xs">
                  No hay transacciones registradas hoy.
                </td>
              </tr>
            ) : (
              recentTransactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-slate-50 group">
                  <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                    {new Date(tx.date).toLocaleDateString('es-DO', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${getTransactionTypeStyle(tx.type)}`}>
                      {getTransactionTypeLabel(tx.type)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold max-w-[280px] truncate" title={tx.description}>
                    {tx.description}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {tx.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {tx.processedBy === 'Admin' ? 'Administrador' : tx.processedBy}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-bold font-mono text-sm ${tx.type === 'income' ? 'text-emerald-600' : tx.type === 'expense' ? 'text-rose-600' : 'text-blue-600'}`}>
                    {tx.type === 'expense' ? '-' : ''}{formatRD(tx.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
