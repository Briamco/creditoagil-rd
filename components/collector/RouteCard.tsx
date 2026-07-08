'use client';

import { formatRD } from '@/lib/currency';
import { formatCedula } from '@/lib/cedula-validator';
import WhatsAppButton from '../loans/WhatsAppButton';
import type { RouteClient } from '@/types';

interface RouteCardProps {
  client: RouteClient;
  routeId: string;
  onLogPayment: (clientId: string) => void;
}

export default function RouteCard({ client, routeId, onLogPayment }: RouteCardProps) {
  const getOverdueColor = (days: number) => {
    if (days === 0) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (days <= 15) return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-rose-50 text-rose-700 border border-rose-100';
  };

  const phone = '809-555-0100'; // Número por defecto para simulaciones

  return (
    <div
      className={`
        p-4 transition-all duration-200 hover:scale-[1.01] border rounded-xl
        ${client.collected
          ? 'opacity-60 border-slate-150 bg-slate-50'
          : 'border-slate-100 bg-white hover:border-blue-500/30 shadow-sm'
        }
      `}
    >
      <div className="flex flex-col gap-3">
        {/* Fila Superior: Nombre y Atraso */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-tight">
              {client.clientName}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
              Cédula: {formatCedula(client.cedula)}
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getOverdueColor(client.daysOverdue)}`}>
            {client.daysOverdue === 0 ? 'Al Día' : `${client.daysOverdue} días`}
          </span>
        </div>

        {/* Fila Central: Dirección y Monto */}
        <div className="flex justify-between items-end">
          <div className="max-w-[70%]">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Dirección de Cobro</span>
            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{client.address}</p>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Monto Pendiente</span>
            <p className="text-sm font-extrabold font-mono text-blue-600 mt-0.5">
              {formatRD(client.amountDue)}
            </p>
          </div>
        </div>

        {/* Fila Inferior: Botones de Acción */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 mt-1">
          {client.collected ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
              Cobro Registrado
            </div>
          ) : (
            <>
              <button
                onClick={() => onLogPayment(client.clientId)}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Cobrar
              </button>
              
              <WhatsAppButton
                phone={phone}
                clientName={client.clientName}
                amount={client.amountDue}
                installmentNum={1} // Por defecto para la ruta
                dueDate={new Date().toISOString()} // Hoy
                size="sm"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
