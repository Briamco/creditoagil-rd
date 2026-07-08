'use client';

import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import MetricCard from '@/components/dashboard/MetricCard';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { BikeIcon, MapIcon } from '@/components/ui/Icons';

export default function DashboardPage() {
  const { state } = useLoanSystem();
  const { loans, cashTransactions, currentRole } = state;

  // Calcular métricas agregadas
  // 1. Total Capital Desembolsado (suma de todos los montos de préstamos activos)
  const totalDisbursed = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.amount, 0);

  // 2. Intereses Acumulados (suma de intereses de todas las cuotas de préstamos activos)
  const totalInterest = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => {
      const loanInterest = l.installments.reduce((instSum, inst) => instSum + inst.interest, 0);
      return sum + loanInterest;
    }, 0);

  // 3. Tasa de Morosidad (porcentaje de cuotas vencidas vs total de cuotas pendientes)
  const activeLoans = loans.filter((l) => l.status === 'active');
  let totalPendingInstallments = 0;
  let overdueInstallments = 0;

  activeLoans.forEach((loan) => {
    loan.installments.forEach((inst) => {
      if (inst.status !== 'paid') {
        totalPendingInstallments++;
        if (inst.status === 'overdue') {
          overdueInstallments++;
        }
      }
    });
  });

  const delinquencyRate = totalPendingInstallments > 0 
    ? (overdueInstallments / totalPendingInstallments) * 100 
    : 0;

  // 4. Efectivo en Caja Operativa (Cobros del Día - Gastos del Día - Depósitos del Día)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = cashTransactions.filter((tx) => tx.date.startsWith(todayStr));

  const cashIn = todayTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const cashOut = todayTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Calcular efectivo total histórico acumulado en caja
  const historicalCashIn = cashTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const historicalCashOut = cashTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const historicalDeposited = cashTransactions
    .filter((tx) => tx.type === 'deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const cashOnHand = historicalCashIn - historicalCashOut - historicalDeposited;

  // Si el usuario es cobrador, mostrar un saludo corto y redirección a sus rutas
  if (currentRole === 'Collector') {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pt-8">
        <div className="bg-white border border-slate-100 p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm shadow-blue-500/5">
            <BikeIcon size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-2 font-[var(--font-heading)]">
            ¡Hola, Ramón Alberto!
          </h2>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            Usted ha ingresado con el rol de **Cobrador**. Su acceso está limitado a la visualización de rutas de cobro asignadas.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="/collector"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:scale-105 transition-all flex items-center gap-2"
            >
              <MapIcon size={16} /> Ver Mi Ruta de Cobro
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 stagger-children">
      {/* Saludo y Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 font-[var(--font-heading)] tracking-tight">
            Panel de Control Financiero
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Resumen operativo y estado de cartera de <span className="text-blue-600 font-semibold">CréditoÁgil RD</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>Último cierre: {new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Capital Desembolsado"
          value={formatRD(totalDisbursed)}
          change="+12.4%"
          icon=""
          trend="up"
          accentColor="teal"
        />
        <MetricCard
          title="Intereses Acumulados"
          value={formatRD(totalInterest)}
          change="+8.3%"
          icon=""
          trend="up"
          accentColor="blue"
        />
        <MetricCard
          title="Tasa de Morosidad"
          value={`${delinquencyRate.toFixed(1)}%`}
          change="-0.5%"
          icon=""
          trend="down"
          accentColor="rose"
        />
        <MetricCard
          title="Efectivo en Caja"
          value={formatRD(cashOnHand)}
          change={`Hoy: ${formatRD(cashIn - cashOut)}`}
          icon=""
          trend={cashIn - cashOut >= 0 ? 'up' : 'down'}
          accentColor="violet"
        />
      </div>

      {/* Gráficos */}
      <DashboardCharts />

      {/* Actividad Reciente */}
      <RecentActivity />
    </div>
  );
}
