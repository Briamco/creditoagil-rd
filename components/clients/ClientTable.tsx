'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import { formatCedula } from '@/lib/cedula-validator';
import RiskBadge from './RiskBadge';
import type { Client, RiskStatus } from '@/types';
import { SearchIcon, PlusIcon } from '@/components/ui/Icons';

interface ClientTableProps {
  onSelectClient?: (client: Client) => void;
  onOpenNewClientModal?: () => void;
}

export default function ClientTable({ onSelectClient, onOpenNewClientModal }: ClientTableProps) {
  const { state } = useLoanSystem();
  const { clients, loans } = state;

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskStatus | 'ALL'>('ALL');

  // Calcular métricas adicionales por cliente en base a préstamos activos
  const clientDataExtended = clients.map((client) => {
    const clientLoans = loans.filter((l) => l.clientId === client.id);
    const activeLoans = clientLoans.filter((l) => l.status === 'active');
    
    // Suma de balances pendientes en cuotas pendientes
    const outstandingBalance = clientLoans
      .filter((l) => l.status === 'active')
      .reduce((sum, loan) => {
        const unpaidInstallmentsSum = loan.installments
          .filter((inst) => inst.status !== 'paid')
          .reduce((instSum, inst) => instSum + (inst.totalPayment - inst.paidAmount), 0);
        return sum + unpaidInstallmentsSum;
      }, 0);

    return {
      ...client,
      activeLoansCount: activeLoans.length,
      outstandingBalance,
    };
  });

  const filteredClients = clientDataExtended.filter((client) => {
    const matchesSearch =
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      client.cedula.includes(search) ||
      client.id.toLowerCase().includes(search.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || client.riskStatus === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="glass-card-solid p-6 relative overflow-hidden animate-fade-in w-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 pb-5 mb-6 relative z-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 font-[var(--font-heading)] tracking-tight">Cartera de Clientes</h2>
          <p className="text-sm text-slate-500 mt-1">Busque y filtre la base de datos de deudores.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{clients.length} Registrados</span>
          </div>
          {onOpenNewClientModal && (
            <button
              onClick={onOpenNewClientModal}
              className="btn-primary"
            >
              <PlusIcon size={14} /> Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 relative z-10">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass pl-10"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-50 p-1 border border-slate-200/60 rounded-lg">
          <button
            onClick={() => setRiskFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              riskFilter === 'ALL'
                ? 'bg-white text-slate-800 border border-slate-200/60 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setRiskFilter('al_dia')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              riskFilter === 'al_dia'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            Al Día
          </button>
          <button
            onClick={() => setRiskFilter('atraso_1_15')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              riskFilter === 'atraso_1_15'
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            Atraso
          </button>
          <button
            onClick={() => setRiskFilter('moroso')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              riskFilter === 'moroso'
                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            Morosos
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr>
              <th className="table-header">ID</th>
              <th className="table-header">Nombre Completo</th>
              <th className="table-header">Cédula</th>
              <th className="table-header">Teléfono</th>
              <th className="table-header">Ciudad</th>
              <th className="table-header">Riesgo</th>
              <th className="table-header-center">Pst. Activos</th>
              <th className="table-header-right">Saldo Pendiente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 italic text-xs">
                  No se encontraron clientes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => onSelectClient?.(client)}
                  className="transition-colors cursor-pointer hover:bg-slate-50 group"
                >
                  <td className="py-3.5 px-4 text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600">
                    {client.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold text-sm">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-550 text-xs">
                    {formatCedula(client.cedula)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {client.phone}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {client.city}
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge status={client.riskStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                    {client.activeLoansCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-sm text-blue-600">
                    {formatRD(client.outstandingBalance)}
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
