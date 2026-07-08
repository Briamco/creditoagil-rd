'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import ClientTable from '@/components/clients/ClientTable';
import ClientForm from '@/components/clients/ClientForm';
import RiskBadge from '@/components/clients/RiskBadge';
import SidePanel, { SidePanelHeader, SidePanelBody } from '@/components/ui/SidePanel';
import { formatRD } from '@/lib/currency';
import { formatCedula } from '@/lib/cedula-validator';
import type { Client } from '@/types';
import { ClientsIcon } from '@/components/ui/Icons';

export default function ClientsPage() {
  const { state } = useLoanSystem();
  const { loans } = state;

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Cargar préstamos del cliente seleccionado
  const clientLoans = selectedClient
    ? loans.filter((l) => l.clientId === selectedClient.id)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Listado de Clientes */}
        <div className={selectedClient ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <ClientTable
            onSelectClient={(c) => setSelectedClient(c)}
            onOpenNewClientModal={() => setIsCreateOpen(true)}
          />
        </div>

        {/* Panel Lateral: Detalle de Cliente */}
        <SidePanel open={!!selectedClient} onClose={() => setSelectedClient(null)} className="lg:col-span-4">
          <SidePanelHeader onClose={() => setSelectedClient(null)}>Ficha del Cliente</SidePanelHeader>
          <SidePanelBody>
            {selectedClient && (<>

            {/* Encabezado Ficha */}
            <div className="space-y-2.5 text-center relative z-10">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-sm shadow-blue-500/5">
                <ClientsIcon size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 leading-tight">
                  {selectedClient.firstName} {selectedClient.lastName}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedClient.id}</p>
              </div>
              <div className="pt-1">
                <RiskBadge status={selectedClient.riskStatus} />
              </div>
            </div>

            {/* Detalles Informativos */}
            <div className="space-y-3.5 text-xs border-t border-b border-slate-200/40 py-4 relative z-10">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Cédula:</span>
                <span className="font-mono text-slate-700 font-semibold">
                  {formatCedula(selectedClient.cedula)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Teléfono:</span>
                <span className="text-slate-700 font-semibold">{selectedClient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Ciudad:</span>
                <span className="text-slate-700 font-semibold">{selectedClient.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Dirección:</span>
                <span className="text-slate-600 text-right font-medium max-w-[200px] truncate" title={selectedClient.address}>
                  {selectedClient.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Registrado:</span>
                <span className="text-slate-500 font-medium">
                  {new Date(selectedClient.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Fiadores / Garantías */}
            {selectedClient.coSigners.length > 0 && (
              <div className="space-y-2 relative z-10">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
                  Fiador Solidario
                </span>
                {selectedClient.coSigners.map((fia, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50/80 border border-slate-100/80 text-xs">
                    <p className="font-semibold text-slate-700">{fia.name}</p>
                    <p className="text-slate-400 font-mono mt-0.5 text-[10px]">{formatCedula(fia.cedula)}</p>
                    <p className="text-slate-500 mt-1 text-[10px]">Relación: <span className="text-slate-700 font-semibold">{fia.relationship}</span> | Tel: <span className="text-slate-700 font-mono font-semibold">{fia.phone}</span></p>
                  </div>
                ))}
              </div>
            )}

            {selectedClient.collateral.length > 0 && (
              <div className="space-y-2 relative z-10">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
                  Colateral / Garantías
                </span>
                {selectedClient.collateral.map((col, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-bold text-[9px] uppercase tracking-wide">
                        {col.type}
                      </span>
                      <span className="font-extrabold text-amber-600 font-mono">{formatRD(col.estimatedValue)}</span>
                    </div>
                    <p className="text-slate-650">{col.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Historial de Préstamos */}
            <div className="space-y-3 relative z-10">
              <span className="text-[9px] font-bold text-slate-455 uppercase tracking-wider block">
                Historial de Préstamos
              </span>
              {clientLoans.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No tiene préstamos registrados.</p>
              ) : (
                <div className="space-y-2">
                  {clientLoans.map((loan) => (
                    <div key={loan.id} className="p-3 rounded-lg bg-slate-50/80 border border-slate-100/80 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-blue-600 font-mono">{loan.id}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {loan.amortizationType === 'french' ? 'Cuota Fija' : 'Interés Simple'} — {loan.term} cuotas
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 font-mono">{formatRD(loan.amount)}</span>
                        <span className={`block text-[9px] uppercase font-bold mt-0.5 ${
                          loan.status === 'active' ? 'text-blue-600' : 'text-slate-450'
                        }`}>
                          {loan.status === 'active' ? 'Activo' : 'Pagado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>)}
          </SidePanelBody>
        </SidePanel>
      </div>

      {/* Modal para Crear Cliente */}
      {isCreateOpen && (
        <ClientForm onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
