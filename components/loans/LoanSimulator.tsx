'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { calculateFrenchAmortization, calculateSimpleInterest, calculateLoanSummary } from '@/lib/amortization';
import { formatRD } from '@/lib/currency';
import AmortizationTable from './AmortizationTable';
import type { PaymentFrequency, AmortizationType, Loan, Installment } from '@/types';
import { SettingsIcon, ReportsIcon, LoansIcon } from '@/components/ui/Icons';

export default function LoanSimulator() {
  const { state, addLoan } = useLoanSystem();
  const { clients } = state;

  const [selectedClientId, setSelectedClientId] = useState('');
  const [amount, setAmount] = useState('50000');
  const [interestRate, setInterestRate] = useState('3.5');
  const [term, setTerm] = useState('12');
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');
  const [amortizationType, setAmortizationType] = useState<AmortizationType>('french');
  const [calculatedInstallments, setCalculatedInstallments] = useState<Installment[]>([]);

  // Buscar cliente seleccionado
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const principal = parseFloat(amount);
    // Convertir porcentaje mensual a decimal (ej: 3.5% -> 0.035)
    const monthlyRate = parseFloat(interestRate) / 100;
    const termPeriods = parseInt(term);

    if (isNaN(principal) || principal <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }
    if (isNaN(monthlyRate) || monthlyRate < 0) {
      alert('Por favor ingrese una tasa válida.');
      return;
    }
    if (isNaN(termPeriods) || termPeriods <= 0) {
      alert('Por favor ingrese un plazo válido.');
      return;
    }

    const startDate = new Date();
    let installments: Installment[] = [];

    if (amortizationType === 'french') {
      installments = calculateFrenchAmortization(principal, monthlyRate, termPeriods, frequency, startDate);
    } else {
      installments = calculateSimpleInterest(principal, monthlyRate, termPeriods, frequency, startDate);
    }

    setCalculatedInstallments(installments);
  };

  const handleCreateLoan = () => {
    if (!selectedClientId) {
      alert('Por favor seleccione un cliente para el préstamo.');
      return;
    }

    if (calculatedInstallments.length === 0) {
      alert('Debe calcular la tabla de amortización primero.');
      return;
    }

    const principal = parseFloat(amount);
    const monthlyRate = parseFloat(interestRate) / 100;
    const termPeriods = parseInt(term);

    const newLoan: Loan = {
      id: `LN-${Math.floor(100 + Math.random() * 900)}`,
      clientId: selectedClientId,
      amount: principal,
      interestRate: monthlyRate,
      term: termPeriods,
      frequency,
      amortizationType,
      status: 'active',
      installments: calculatedInstallments,
      disbursementDate: new Date().toISOString(),
      createdBy: state.currentUser,
    };

    addLoan(newLoan);
    alert(`Préstamo ${newLoan.id} desembolsado exitosamente para ${selectedClient?.firstName} ${selectedClient?.lastName}.`);
    
    // Resetear formulario
    setSelectedClientId('');
    setCalculatedInstallments([]);
  };

  const summary = calculateLoanSummary(calculatedInstallments);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Panel Izquierdo: Parámetros */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
          <SettingsIcon size={16} className="text-slate-500" /> Parámetros del Préstamo
        </h3>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Cliente Asociado <span className="text-blue-600">*</span>
            </label>
            <select
              required
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
            >
              <option value="">-- Seleccionar Cliente --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.cedula})
                </option>
              ))}
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
                min="1000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                placeholder="Monto a prestar"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tasa Mensual (%) <span className="text-blue-600">*</span>
              </label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                placeholder="Ej. 3.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Plazo (Cuotas) <span className="text-blue-600">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                placeholder="Cantidad de cuotas"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Frecuencia <span className="text-blue-600">*</span>
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PaymentFrequency)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal (Quincenal)</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tipo de Amortización <span className="text-blue-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 border border-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => setAmortizationType('french')}
                className={`py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  amortizationType === 'french'
                    ? 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cuota Fija (Francés)
              </button>
              <button
                type="button"
                onClick={() => setAmortizationType('simple')}
                className={`py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  amortizationType === 'simple'
                    ? 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Interés Plano (San)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
          >
            <ReportsIcon size={14} /> Calcular Tabla
          </button>
        </form>

        {calculatedInstallments.length > 0 && selectedClient && (
          <div className="mt-6 border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Resumen de Desembolso
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Cliente:</span>
                <span className="font-bold text-slate-700">
                  {selectedClient.firstName} {selectedClient.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Total Intereses:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {formatRD(summary.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Total a Pagar:</span>
                <span className="font-bold text-amber-600 font-mono">
                  {formatRD(summary.totalPayments)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-100">
                <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Valor Cuota:</span>
                <span className="font-extrabold text-blue-600 font-mono text-sm">
                  {formatRD(calculatedInstallments[0]?.totalPayment || 0)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateLoan}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <LoansIcon size={14} /> Desembolsar Préstamo (RD$)
            </button>
          </div>
        )}
      </div>

      {/* Panel Derecho: Tabla de Amortización */}
      <div className="lg:col-span-7 bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
          <ReportsIcon size={16} className="text-slate-500" /> Tabla de Amortización Preliminar
        </h3>
        <div className="flex-1">
          <AmortizationTable
            installments={calculatedInstallments}
            clientName={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : undefined}
            clientPhone={selectedClient?.phone}
            maxHeight="max-h-[500px]"
          />
        </div>
      </div>
    </div>
  );
}
