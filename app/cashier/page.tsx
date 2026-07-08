'use client';

import { useState } from 'react';
import CashierWindow from '@/components/cashier/CashierWindow';
import ExpenseRegistry from '@/components/cashier/ExpenseRegistry';
import BankDepositForm from '@/components/cashier/BankDeposit';

export default function CashierPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses' | 'deposits'>('payments');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 font-[var(--font-heading)] tracking-tight">Ventanilla de Caja Operativa</h2>
          <p className="text-sm text-slate-500 mt-1">Gestión de recaudaciones, egresos y cuadres de caja del día.</p>
        </div>

        {/* Control de Pestañas */}
        <div className="flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/60 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-white text-blue-600 border border-slate-200/60 shadow-sm'
                : 'text-slate-500 border border-transparent hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            Recibir Pagos
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-white text-rose-600 border border-slate-200/60 shadow-sm'
                : 'text-slate-500 border border-transparent hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            Gastos
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'deposits'
                ? 'bg-white text-indigo-600 border border-slate-200/60 shadow-sm'
                : 'text-slate-500 border border-transparent hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            Depósitos
          </button>
        </div>
      </div>

      {/* Renderizado de Ventanas */}
      <div className="mt-4">
        {activeTab === 'payments' && <CashierWindow />}
        {activeTab === 'expenses' && <ExpenseRegistry />}
        {activeTab === 'deposits' && <BankDepositForm />}
      </div>
    </div>
  );
}
