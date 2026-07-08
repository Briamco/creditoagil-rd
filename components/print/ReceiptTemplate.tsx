'use client';

import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import { formatCedula } from '@/lib/cedula-validator';

interface ReceiptTemplateProps {
  paymentId?: string;
}

export default function ReceiptTemplate({ paymentId }: ReceiptTemplateProps) {
  const { state } = useLoanSystem();
  const { payments, clients, loans } = state;

  // Si no se provee ID, usar el último pago registrado
  const payment = paymentId 
    ? payments.find((p) => p.id === paymentId)
    : payments[payments.length - 1];

  if (!payment) {
    return (
      <div className="p-8 text-center text-slate-500 italic">
        No se encontró ningún recibo de pago para imprimir.
      </div>
    );
  }

  const client = clients.find((c) => c.id === payment.clientId);
  const loan = loans.find((l) => l.id === payment.loanId);

  return (
    <div className="print-receipt bg-white text-black p-4 font-mono text-xs w-[302px] mx-auto border border-dashed border-slate-300">
      <div className="text-center space-y-1">
        <h2 className="text-sm font-bold uppercase tracking-wider">CRÉDITOÁGIL RD</h2>
        <p className="text-[10px] text-slate-700">RNC: 131-45678-9</p>
        <p className="text-[10px] text-slate-700">Av. 27 de Febrero #45, Santo Domingo</p>
        <p className="text-[10px] text-slate-700">Tel: 809-555-0100</p>
      </div>

      <div className="receipt-divider border-t border-dashed border-black my-3" />

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>RECIBO NO:</span>
          <span className="font-bold">{payment.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>FECHA:</span>
          <span>
            {new Date(payment.date).toLocaleString('es-DO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      <div className="receipt-divider border-t border-dashed border-black my-3" />

      <div className="space-y-1 text-[11px]">
        <div>
          <span className="text-slate-600">CLIENTE:</span>
          <p className="font-bold">{client ? `${client.firstName} ${client.lastName}` : 'N/A'}</p>
        </div>
        <div className="flex justify-between">
          <span>CÉDULA:</span>
          <span>{client ? formatCedula(client.cedula) : 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>PRÉSTAMO:</span>
          <span className="font-bold">{payment.loanId}</span>
        </div>
        <div className="flex justify-between">
          <span>CUOTA APLICADA:</span>
          <span className="font-bold">#{payment.installmentNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>TIPO PAGO:</span>
          <span className="uppercase">{payment.paymentType === 'regular' ? 'Cuota Regular' : payment.paymentType === 'capital' ? 'Abono a Capital' : 'Saldo Total'}</span>
        </div>
      </div>

      <div className="receipt-divider border-t border-dashed border-black my-3" />

      <div className="space-y-1.5 py-1 text-center bg-slate-100 rounded">
        <span className="text-[10px] uppercase font-bold text-slate-600 block">Monto Recibido</span>
        <span className="text-base font-extrabold block">{formatRD(payment.amount)}</span>
      </div>

      {loan && (
        <div className="mt-3 space-y-1 text-[10px] text-slate-700">
          <div className="flex justify-between">
            <span>Capital Amortizado:</span>
            <span>{formatRD(payment.amount - (loan.installments.find(i => i.number === payment.installmentNumber)?.interest || 0))}</span>
          </div>
          <div className="flex justify-between">
            <span>Interés Cobrado:</span>
            <span>{formatRD(loan.installments.find(i => i.number === payment.installmentNumber)?.interest || 0)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-200 pt-1 mt-1 text-black">
            <span>Balance Pendiente:</span>
            <span>
              {formatRD(
                loan.installments
                  .filter((inst) => inst.status !== 'paid')
                  .reduce((sum, inst) => sum + (inst.totalPayment - inst.paidAmount), 0)
              )}
            </span>
          </div>
        </div>
      )}

      <div className="receipt-divider border-t border-dashed border-black my-4" />

      <div className="text-center space-y-8 mt-6">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-700">Procesado por: {payment.receivedBy === 'Admin' ? 'Administrador' : payment.receivedBy}</p>
          <div className="w-40 border-b border-black mx-auto pt-6" />
          <p className="text-[9px] uppercase tracking-wider text-slate-500">Firma Autorizada / Cajero</p>
        </div>

        <p className="text-[10px] italic font-semibold pt-2">¡Gracias por su pago y puntualidad!</p>
      </div>
    </div>
  );
}
