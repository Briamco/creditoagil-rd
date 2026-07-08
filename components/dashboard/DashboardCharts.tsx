'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD, formatRDCompact } from '@/lib/currency';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

export default function DashboardCharts() {
  const { state } = useLoanSystem();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Calcular desembolsos mensuales para el gráfico de barras (últimos 6 meses)
  const now = new Date();
  const monthlyData = monthLabels.map((_, idx) => {
    const targetMonth = now.getMonth() - (5 - idx);
    const targetYear = now.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;

    return state.loans
      .filter((loan) => {
        const d = new Date(loan.disbursementDate);
        return d.getMonth() === normalizedMonth && d.getFullYear() === targetYear;
      })
      .reduce((sum, loan) => sum + loan.amount, 0);
  });

  const maxVal = Math.max(...monthlyData, 100000); // Mínimo 100K para escala sutil
  const roundedMax = Math.ceil(maxVal / 50000) * 50000;

  // Cartera por estado para el gráfico de dona
  const activeLoans = state.loans.filter((l) => l.status === 'active').length;
  const paidLoans = state.loans.filter((l) => l.status === 'paid').length;
  const defaultedLoans = state.loans.filter((l) => l.status === 'defaulted').length;
  const totalLoans = activeLoans + paidLoans + defaultedLoans;

  const totalLoansSafe = Math.max(totalLoans, 1);
  const activePct = (activeLoans / totalLoansSafe) * 100;
  const paidPct = (paidLoans / totalLoansSafe) * 100;
  const defaultedPct = (defaultedLoans / totalLoansSafe) * 100;

  // Parámetros del gráfico de dona SVG
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~314.16

  const activeDash = (activePct / 100) * circumference;
  const paidDash = (paidPct / 100) * circumference;
  const defaultedDash = (defaultedPct / 100) * circumference;

  const activeOffset = 0;
  const paidOffset = -activeDash;
  const defaultedOffset = -(activeDash + paidDash);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras — Colocaciones Mensuales */}
      <div className="glass-card-solid p-6 relative overflow-hidden animate-fade-in">
        {/* Glow sutil */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Colocaciones Mensuales
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Valores en RD$</span>
        </div>

        <div className="relative h-56 w-full">
          {/* Gráfico SVG Autocontenido */}
          <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Definición de Gradiente */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity="1" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Líneas de Cuadrícula Horizontales */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = 20 + 130 * (1 - ratio);
              return (
                <g key={index}>
                  <line
                    x1="55"
                    y1={y}
                    x2="490"
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray={index === 0 ? "0" : "4 4"}
                  />
                  <text
                    x="45"
                    y={y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {formatRDCompact(roundedMax * ratio)}
                  </text>
                </g>
              );
            })}

            {/* Barras y Etiquetas */}
            {monthlyData.map((val, idx) => {
              const barWidth = 32;
              const spacing = (420 - barWidth * 6) / 5;
              const x = 70 + idx * (barWidth + spacing);
              const height = (val / roundedMax) * 130;
              const y = 150 - height;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Barra de Fondo Sutil para facilitar hover */}
                  <rect
                    x={x - 8}
                    y="10"
                    width={barWidth + 16}
                    height="150"
                    fill="transparent"
                  />

                  {/* Barra Principal SVG */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(height, 2)}
                    rx="4"
                    fill={hoveredBar === idx ? "url(#barGradientHover)" : "url(#barGradient)"}
                    className="transition-all duration-300"
                  />

                  {/* Texto de Eje X */}
                  <text
                    x={x + barWidth / 2}
                    y="172"
                    textAnchor="middle"
                    fill={hoveredBar === idx ? "#0f172a" : "#64748b"}
                    fontSize="10"
                    fontWeight="bold"
                    className="transition-colors duration-200"
                  >
                    {monthLabels[idx]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip flotante HTML sobre las barras */}
          {hoveredBar !== null && (
            <div
              className="absolute bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded shadow-lg border border-slate-800 -translate-x-1/2 pointer-events-none animate-fade-in-scale"
              style={{
                left: `${14 + (hoveredBar * 14.5) + 3.2}%`, // Centrado aproximado
                bottom: `${(monthlyData[hoveredBar] / roundedMax) * 65 + 45}px`,
              }}
            >
              <div className="text-center font-mono">
                <span className="text-blue-400 block mb-0.5">{monthLabels[hoveredBar]}</span>
                {formatRD(monthlyData[hoveredBar])}
              </div>
              {/* Flecha del tooltip */}
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-800 rotate-45" />
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Dona — Cartera por Estado */}
      <div className="glass-card-solid p-6 relative overflow-hidden animate-fade-in">
        {/* Glow sutil */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Cartera por Estado
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Resumen Global</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 py-2">
          {/* Dona SVG */}
          <div className="relative w-40 h-40 flex-shrink-0 group cursor-default transition-transform duration-300">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              {/* Círculo base gris */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />

              <g transform="rotate(-90 60 60)">
                {/* Segmento 1: Activos (Azul) */}
                {activeLoans > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${activeDash} ${circumference}`}
                    strokeDashoffset={activeOffset}
                    strokeLinecap={totalLoans === activeLoans ? "butt" : "round"}
                    className="transition-all duration-500"
                  />
                )}

                {/* Segmento 2: Pagados (Verde) */}
                {paidLoans > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${paidDash} ${circumference}`}
                    strokeDashoffset={paidOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                )}

                {/* Segmento 3: En Mora (Rojo) */}
                {defaultedLoans > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${defaultedDash} ${circumference}`}
                    strokeDashoffset={defaultedOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                )}
              </g>
            </svg>

            {/* Texto Central */}
            <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800 font-[var(--font-heading)] leading-none mb-1">
                  {totalLoans}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Préstamos</p>
              </div>
            </div>
          </div>

          {/* Leyenda y Detalles */}
          <div className="space-y-3.5 flex-1 w-full">
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-lg border border-slate-100/80">
              <span className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
              <span className="text-xs font-semibold text-slate-600 flex-1">Activos</span>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 font-mono block leading-none">{activeLoans}</span>
                <span className="text-[9px] text-slate-400 font-semibold font-mono">{activePct.toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-lg border border-slate-100/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-xs font-semibold text-slate-600 flex-1">Pagados</span>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 font-mono block leading-none">{paidLoans}</span>
                <span className="text-[9px] text-slate-400 font-semibold font-mono">{paidPct.toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-lg border border-slate-100/80">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
              <span className="text-xs font-semibold text-slate-600 flex-1">En Mora</span>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 font-mono block leading-none">{defaultedLoans}</span>
                <span className="text-[9px] text-slate-400 font-semibold font-mono">{defaultedPct.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
