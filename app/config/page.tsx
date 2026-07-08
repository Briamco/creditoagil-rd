'use client';

import { useLoanSystem } from '@/context/LoanSystemContext';

export default function ConfigPage() {
  const { state, resetData } = useLoanSystem();

  const handleReset = () => {
    if (confirm('¿Está seguro de que desea reiniciar la base de datos local? Se perderán todos los cambios y se recargarán los datos semilla dominicanos.')) {
      resetData();
      alert('Base de datos reiniciada con éxito.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 font-[var(--font-heading)] tracking-tight">Configuración del Sistema</h2>
          <p className="text-sm text-slate-500 mt-1">Configure parámetros de tasas, mora y mantenimiento de datos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parámetros de Mora y Tasas */}
        <div className="glass-card-solid p-6 space-y-5 relative overflow-hidden">
          <div className="glow-blob-blue top-0 right-0 w-24 h-24" />
          <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider relative z-10">
            Reglas Operativas
          </h3>
          <div className="space-y-4 text-xs relative z-10">
            <div>
              <label className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-2">Recargo por Mora Diario (%)</label>
              <input
                type="text"
                disabled
                value="0.10 %"
                className="input-glass cursor-not-allowed text-slate-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-2">Tasa Límite de Interés Mensual</label>
              <input
                type="text"
                disabled
                value="10.00 %"
                className="input-glass cursor-not-allowed text-slate-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-2">Moneda del Sistema</label>
              <input
                type="text"
                disabled
                value="DOP — Peso Dominicano (RD$)"
                className="input-glass cursor-not-allowed text-slate-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Mantenimiento de Datos */}
        <div className="glass-card-solid p-6 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-[10px] font-bold text-rose-600 uppercase tracking-wider relative z-10">
            Mantenimiento de Datos
          </h3>
          <div className="space-y-4 text-xs relative z-10">
            <p className="text-slate-500 leading-relaxed font-medium">
              Esta aplicación guarda todo su estado directamente en el almacenamiento local de su navegador (**LocalStorage**).
            </p>
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-700 leading-relaxed font-semibold">
              Al hacer clic en el botón de abajo, se borrarán todos los cambios que haya realizado (nuevos clientes, préstamos desembolsados o cobros de cuotas) y el sistema se re-inicializará con las 5 cuentas semilla dominicanas originales.
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] shadow-md shadow-rose-500/10 cursor-pointer"
              >
                Reiniciar Base de Datos Local
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
