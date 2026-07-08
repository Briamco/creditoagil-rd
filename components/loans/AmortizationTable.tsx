'use client';

import { formatRD } from '@/lib/currency';
import WhatsAppButton from './WhatsAppButton';
import type { Installment } from '@/types';

interface AmortizationTableProps {
  installments: Installment[];
  clientName?: string;
  clientPhone?: string;
  maxHeight?: string;
}

export default function AmortizationTable({
  installments,
  clientName,
  clientPhone,
  maxHeight = 'max-h-[450px]',
}: AmortizationTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      case 'overdue':
        return 'text-rose-700 bg-rose-50 border border-rose-100';
      case 'partial':
        return 'text-amber-700 bg-amber-50 border border-amber-100';
      default:
        return 'text-slate-600 bg-slate-50 border border-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagada';
      case 'overdue':
        return 'Vencida';
      case 'partial':
        return 'Abonada';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className={`overflow-y-auto border border-slate-200/80 rounded-lg ${maxHeight}`}>
      <table className="w-full text-left text-xs border-collapse relative">
        <thead className="bg-slate-50 sticky top-0 z-10">
          <tr>
            <th className="table-header-center w-12">No.</th>
            <th className="table-header">Fecha Vence</th>
            <th className="table-header-right">Capital</th>
            <th className="table-header-right">Interés</th>
            <th className="table-header-right">Mora</th>
            <th className="table-header-right">Cuota Total</th>
            <th className="table-header-right">Saldo Restante</th>
            <th className="table-header-center">Estado</th>
            {clientName && clientPhone && <th className="table-header-center">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-transparent">
          {installments.length === 0 ? (
            <tr>
              <td colSpan={clientName && clientPhone ? 9 : 8} className="py-8 text-center text-slate-400 italic">
                Ingrese parámetros y calcule la tabla de amortización.
              </td>
            </tr>
          ) : (
            installments.map((inst) => {
              const isUnpaid = inst.status === 'pending' || inst.status === 'overdue' || inst.status === 'partial';

              return (
                <tr key={inst.number} className="table-hover-row transition-colors group">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-semibold font-mono">
                    {inst.number}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-semibold">
                    {new Date(inst.dueDate).toLocaleDateString('es-DO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {formatRD(inst.principal)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {formatRD(inst.interest)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-semibold">
                    {inst.lateFee > 0 ? formatRD(inst.lateFee) : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">
                    {formatRD(inst.totalPayment)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    {formatRD(inst.remainingBalance)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusBadge(inst.status)}`}>
                      {getStatusLabel(inst.status)}
                    </span>
                  </td>
                  {clientName && clientPhone && (
                    <td className="py-2.5 px-3 text-center">
                      {isUnpaid ? (
                        <WhatsAppButton
                          phone={clientPhone}
                          clientName={clientName}
                          amount={inst.totalPayment - inst.paidAmount}
                          installmentNum={inst.number}
                          dueDate={inst.dueDate}
                          size="sm"
                        />
                      ) : (
                        <span className="text-slate-400 font-semibold text-[11px]">Pagada</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
