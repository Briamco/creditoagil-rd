'use client';

import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';

export default function ReportsPage() {
  const { state } = useLoanSystem();
  const { loans, cashTransactions, expenses, bankDeposits } = state;

  // Cálculos estadísticos
  const activeLoans = loans.filter((l) => l.status === 'active');
  const paidLoans = loans.filter((l) => l.status === 'paid');

  const totalDisbursedActive = activeLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalDisbursedPaid = paidLoans.reduce((sum, l) => sum + l.amount, 0);

  const totalInterestEarned = cashTransactions
    .filter((tx) => tx.category === 'Cobro de Préstamo')
    .reduce((sum, tx) => {
      // De los cobros de préstamo, una parte es interés. Para simplificar,
      // calculamos el interés estimado como un 25% de los cobros en este mockup
      return sum + tx.amount * 0.25;
    }, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDeposits = bankDeposits.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 font-[var(--font-heading)] tracking-tight">Reportes de Cartera y Caja</h2>
          <p className="text-sm text-slate-500 mt-1">Consulte los reportes generales de rentabilidad y saldos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumen de Cartera */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 relative z-10">
            Resumen de Cartera
          </h3>
          <div className="space-y-2.5 text-xs relative z-10">
            <div className="flex justify-between">
              <span className="text-slate-500">Préstamos Activos:</span>
              <span className="font-semibold text-slate-700">{activeLoans.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Préstamos Liquidados:</span>
              <span className="font-semibold text-slate-700">{paidLoans.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Capital Activo Desembolsado:</span>
              <span className="font-bold text-blue-600 font-mono">{formatRD(totalDisbursedActive)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Capital Histórico Retornado:</span>
              <span className="font-bold text-slate-600 font-mono">{formatRD(totalDisbursedPaid)}</span>
            </div>
          </div>
        </div>

        {/* Resumen de Caja y Gastos */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5 relative z-10">
            Gastos y Rendimientos
          </h3>
          <div className="space-y-2.5 text-xs relative z-10">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Gastos Operativos:</span>
              <span className="font-bold text-rose-600 font-mono">-{formatRD(totalExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Depósitos Bancarios Totales:</span>
              <span className="font-bold text-indigo-600 font-mono">{formatRD(totalDeposits)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Intereses Cobrados (Est.):</span>
              <span className="font-bold text-emerald-600 font-mono">+{formatRD(totalInterestEarned)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
              <span className="text-slate-600">Retorno Neto (Interés - Gastos):</span>
              <span className="font-extrabold font-mono text-blue-600">
                {formatRD(totalInterestEarned - totalExpenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Distribución por Banco */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 relative z-10">
            Distribución Bancaria
          </h3>
          <div className="space-y-2.5 text-xs relative z-10">
            <div className="flex justify-between">
              <span className="text-slate-500">Banco de Reservas:</span>
              <span className="font-bold text-slate-700 font-mono">
                {formatRD(bankDeposits.filter((d) => d.bank === 'banreservas').reduce((sum, d) => sum + d.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Banco Popular Dominicano:</span>
              <span className="font-bold text-slate-700 font-mono">
                {formatRD(bankDeposits.filter((d) => d.bank === 'banco_popular').reduce((sum, d) => sum + d.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Banco BHD León:</span>
              <span className="font-bold text-slate-700 font-mono">
                {formatRD(bankDeposits.filter((d) => d.bank === 'bhd').reduce((sum, d) => sum + d.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial Consolidado de Caja */}
      <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 relative z-10 font-[var(--font-heading)]">
          Historial Consolidado de Transacciones de Caja
        </h3>
        <div className="overflow-x-auto max-h-[400px] relative z-10">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...cashTransactions]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-slate-50">
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {new Date(tx.date).toLocaleDateString('es-DO')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono font-bold">{tx.id}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{tx.category}</td>
                    <td className="py-3.5 px-4 text-slate-600">{tx.description}</td>
                    <td className={`py-3.5 px-4 text-right font-extrabold font-mono text-sm ${
                      tx.type === 'income' ? 'text-emerald-600' : tx.type === 'expense' ? 'text-rose-600' : 'text-blue-600'
                    }`}>
                      {tx.type === 'expense' ? '-' : ''}{formatRD(tx.amount)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
