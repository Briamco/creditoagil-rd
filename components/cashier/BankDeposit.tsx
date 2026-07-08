'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import type { BankDeposit, BankName } from '@/types';

export default function BankDepositForm() {
  const { state, addDeposit } = useLoanSystem();
  const { bankDeposits } = state;

  const [bank, setBank] = useState<BankName>('banreservas');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert('Por favor ingrese un monto de depósito válido.');
      return;
    }

    if (!referenceNumber) {
      alert('Por favor ingrese el número de referencia del depósito bancario.');
      return;
    }

    const newDeposit: BankDeposit = {
      id: `DEP-${Date.now()}`,
      bank,
      amount: val,
      referenceNumber,
      date: new Date().toISOString(),
      depositedBy: state.currentUser,
    };

    addDeposit(newDeposit);
    alert(`Depósito de ${formatRD(val)} registrado exitosamente en ${formatBankName(bank)}.`);

    // Resetear formulario
    setAmount('');
    setReferenceNumber('');
  };

  function formatBankName(name: BankName): string {
    const names: Record<BankName, string> = {
      banreservas: 'Banreservas',
      banco_popular: 'Banco Popular',
      bhd: 'BHD León',
    };
    return names[name] || name;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Formulario */}
      <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
          Registrar Depósito Bancario
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Banco Destino <span className="text-blue-600">*</span>
            </label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value as BankName)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none cursor-pointer"
            >
              <option value="banreservas">Banreservas</option>
              <option value="banco_popular">Banco Popular</option>
              <option value="bhd">BHD León</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Monto (RD$) <span className="text-blue-600">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Número de Referencia <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                placeholder="BR-123456"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.01] shadow-md shadow-blue-500/10 cursor-pointer"
          >
            Registrar Depósito
          </button>
        </form>
      </div>

      {/* Historial de Depósitos */}
      <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
          Historial de Depósitos Recientes
        </h3>

        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Banco</th>
                <th className="py-2.5 px-3">Referencia</th>
                <th className="py-2.5 px-3">Depositado Por</th>
                <th className="py-2.5 px-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-transparent">
              {bankDeposits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No se han registrado depósitos bancarios.
                  </td>
                </tr>
              ) : (
                [...bankDeposits]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((dep) => (
                    <tr key={dep.id} className="table-hover-row transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {new Date(dep.date).toLocaleDateString('es-DO')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold uppercase">
                        {formatBankName(dep.bank)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {dep.referenceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {dep.depositedBy}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-blue-600">
                        +{formatRD(dep.amount)}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
