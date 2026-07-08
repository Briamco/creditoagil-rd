'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import type { Expense } from '@/types';

export default function ExpenseRegistry() {
  const { state, addExpense } = useLoanSystem();
  const { expenses } = state;

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Material de Oficina');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert('Por favor ingrese un monto de gasto válido.');
      return;
    }

    const newExpense: Expense = {
      id: `EXP-${Date.now()}`,
      description,
      amount: val,
      category,
      date: new Date().toISOString(),
      registeredBy: state.currentUser,
    };

    addExpense(newExpense);
    alert(`Gasto registrado por ${formatRD(val)} en la categoría ${category}.`);

    // Resetear formulario
    setDescription('');
    setAmount('');
  };  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Formulario */}
      <div className="lg:col-span-5 glass-card-solid p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
          Registrar Gasto Administrativo
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Descripción del Gasto <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-glass"
              placeholder="Ej. Combustible para ruta o papel de oficina"
            />
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
                Categoría <span className="text-blue-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-glass cursor-pointer"
              >
                <option value="Material de Oficina">Material de Oficina</option>
                <option value="Transporte">Transporte / Combustible</option>
                <option value="Servicios Públicos">Servicios Públicos</option>
                <option value="Alimentación">Alimentación / Almuerzos</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Comisiones">Comisiones</option>
                <option value="Otros">Otros Gastos</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.01] shadow-md shadow-rose-500/10 cursor-pointer"
          >
            Registrar Gasto
          </button>
        </form>
      </div>

      {/* Historial de Gastos */}
      <div className="lg:col-span-7 glass-card-solid p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
          Historial de Gastos Recientes
        </h3>

        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="table-header">Fecha</th>
                <th className="table-header">Descripción</th>
                <th className="table-header">Categoría</th>
                <th className="table-header">Registrado Por</th>
                <th className="table-header-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-transparent">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No se han registrado gastos administrativos.
                  </td>
                </tr>
              ) : (
                [...expenses]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((exp) => (
                    <tr key={exp.id} className="table-hover-row transition-colors">
                      <td className="py-2.5 px-3 text-slate-550 font-mono">
                        {new Date(exp.date).toLocaleDateString('es-DO')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">
                        {exp.description}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {exp.category}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {exp.registeredBy}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-rose-600">
                        -{formatRD(exp.amount)}
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
