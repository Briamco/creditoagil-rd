'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import Dialog, { DialogHeader, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { formatRD } from '@/lib/currency';

interface ReceiptLoggerProps {
  clientId: string;
  clientName: string;
  amountDue: number;
  routeId: string;
  onClose: () => void;
}

export default function ReceiptLogger({
  clientId,
  clientName,
  amountDue,
  routeId,
  onClose,
}: ReceiptLoggerProps) {
  const { logReceipt } = useLoanSystem();

  const [collectedAmount, setCollectedAmount] = useState(amountDue.toString());
  const [receiptNumber, setReceiptNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(collectedAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un monto recolectado válido.');
      return;
    }

    if (!receiptNumber) {
      alert('Por favor ingrese el número del recibo físico entregado.');
      return;
    }

    logReceipt(routeId, clientId, receiptNumber);
    alert(`Cobro de ${formatRD(amount)} registrado para ${clientName}. Recibo: ${receiptNumber}`);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} size="sm">
      <DialogHeader onClose={onClose}>Registrar Cobro en Campo</DialogHeader>

      <DialogBody className="space-y-4">
        <form id="receipt-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cliente</span>
            <p className="text-sm font-bold text-slate-700 mt-0.5">{clientName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Monto Pendiente
              </label>
              <p className="text-sm font-bold font-mono text-amber-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                {formatRD(amountDue)}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Monto Cobrado (RD$)
              </label>
              <input
                type="number"
                required
                value={collectedAmount}
                onChange={(e) => setCollectedAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono font-bold text-blue-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Número de Recibo Físico <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. REC-C-1045"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
            <span className="text-[9px] text-slate-400 mt-1 block leading-relaxed font-medium">
              Ingrese el número de recibo del talonario entregado al cliente.
            </span>
          </div>

        </form>
      </DialogBody>

      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="receipt-form"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-md shadow-blue-500/10 cursor-pointer"
        >
          Confirmar Cobro
        </button>
      </DialogFooter>
    </Dialog>
  );
}
