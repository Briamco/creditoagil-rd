'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import AmortizationTable from '@/components/loans/AmortizationTable';
import type { Loan } from '@/types';
import SidePanel, { SidePanelHeader, SidePanelBody } from '@/components/ui/SidePanel';
import { SimulatorIcon, PrintIcon } from '@/components/ui/Icons';

export default function LoansPage() {
  const { state } = useLoanSystem();
  const { loans, clients } = state;

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);
  const selectedClient = selectedLoan 
    ? clients.find((c) => c.id === selectedLoan.clientId)
    : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-700 bg-blue-50 border border-blue-100';
      case 'paid':
        return 'text-slate-650 bg-slate-50 border border-slate-100';
      case 'defaulted':
        return 'text-rose-700 bg-rose-50 border border-rose-100';
      default:
        return 'text-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'paid':
        return 'Pagado';
      case 'defaulted':
        return 'Moroso/Def';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 font-[var(--font-heading)] tracking-tight">Contratos de Préstamos</h2>
          <p className="text-sm text-slate-500 mt-1">Consulte los préstamos desembolsados y su amortización.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{loans.filter((l) => l.status === 'active').length} Contratos Activos</span>
          </div>
              <a
                href="/loans/simulator"
                className="btn-primary"
              >
                <SimulatorIcon size={14} /> Simular Préstamo
              </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Listado de Préstamos */}
        <div className={selectedLoan ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div className="glass-card-solid p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="table-header">Contrato ID</th>
                    <th className="table-header">Cliente</th>
                    <th className="table-header-right">Capital</th>
                    <th className="table-header-center">Tasa</th>
                    <th className="table-header-center">Plazo</th>
                    <th className="table-header">Frecuencia</th>
                    <th className="table-header">Tipo</th>
                    <th className="table-header-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic text-xs">
                        No hay préstamos contratados actualmente.
                      </td>
                    </tr>
                  ) : (
                    loans.map((loan) => {
                      const client = clients.find((c) => c.id === loan.clientId);
                      const isSelected = loan.id === selectedLoanId;
                      return (
                        <tr
                          key={loan.id}
                          onClick={() => setSelectedLoanId(loan.id)}
                          className={`transition-colors cursor-pointer group ${
                            isSelected ? 'bg-blue-50 hover:bg-blue-100/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className={`py-3.5 px-4 font-mono font-bold text-xs transition-colors ${
                            isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'
                          }`}>
                            {loan.id}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold text-sm">
                            {client ? `${client.firstName} ${client.lastName}` : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                            {formatRD(loan.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                            {(loan.interestRate * 100).toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                            {loan.term}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs capitalize">
                            {loan.frequency === 'daily' ? 'Diario' : loan.frequency === 'weekly' ? 'Semanal' : loan.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs">
                            {loan.amortizationType === 'french' ? 'Cuota Fija' : 'Int. Plano'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(loan.status)}`}>
                              {getStatusLabel(loan.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Amortización Detallada */}
        <SidePanel open={!!selectedLoan} onClose={() => setSelectedLoanId(null)} className="lg:col-span-5">
          <SidePanelHeader onClose={() => setSelectedLoanId(null)} subtitle={`ID: ${selectedLoan?.id ?? ''}`}>
            Amortización de Contrato
          </SidePanelHeader>
          <SidePanelBody>
            {selectedLoan && (<>

            {selectedClient && (
              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100/80 text-xs space-y-2.5 relative z-10">
                <div className="flex justify-between">
                  <span className="text-slate-450 font-bold uppercase text-[9px] tracking-wider">Deudor Principal:</span>
                  <span className="font-bold text-slate-700">{selectedClient.firstName} {selectedClient.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455 font-bold uppercase text-[9px] tracking-wider">Teléfono:</span>
                  <span className="text-slate-650 font-mono font-semibold">{selectedClient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450 font-bold uppercase text-[9px] tracking-wider">Monto Original:</span>
                  <span className="font-extrabold text-blue-600 font-mono text-sm">{formatRD(selectedLoan.amount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200/40 items-center">
                  <span className="text-slate-450 font-bold uppercase text-[9px] tracking-wider">Pagaré Notarial:</span>
                  <a
                    href={`/print/pagare?loanId=${selectedLoan.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded text-blue-700 font-bold transition-all text-[11px]"
                  >
                    <PrintIcon size={12} /> Imprimir Pagaré
                  </a>
                </div>
              </div>
            )}

            <AmortizationTable
              installments={selectedLoan?.installments ?? []}
              clientName={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : undefined}
              clientPhone={selectedClient?.phone}
              maxHeight="max-h-[400px]"
            />
            </>)}
          </SidePanelBody>
        </SidePanel>
      </div>
    </div>
  );
}
