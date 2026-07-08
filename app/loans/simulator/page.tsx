'use client';

import LoanSimulator from '@/components/loans/LoanSimulator';

export default function LoanSimulatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-[var(--font-heading)]">Simulador y Creador de Préstamos</h2>
        <p className="text-sm text-slate-400 mt-1">
          Calcule cuotas de amortización francesa e interés simple adaptado al mercado dominicano.
        </p>
      </div>

      <LoanSimulator />
    </div>
  );
}
