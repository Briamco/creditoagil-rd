'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import RouteCard from '@/components/collector/RouteCard';
import ReceiptLogger from '@/components/collector/ReceiptLogger';

export default function CollectorPage() {
  const { state } = useLoanSystem();
  const { collectorRoutes } = state;

  const [activeRouteId, setActiveRouteId] = useState(collectorRoutes[0]?.id || '');
  const [selectedLogClient, setSelectedLogClient] = useState<{
    id: string;
    name: string;
    amountDue: number;
  } | null>(null);

  const activeRoute = collectorRoutes.find((r) => r.id === activeRouteId);

  const handleOpenReceiptLog = (clientId: string) => {
    const routeClient = activeRoute?.clients.find((c) => c.clientId === clientId);
    if (routeClient) {
      setSelectedLogClient({
        id: routeClient.clientId,
        name: routeClient.clientName,
        amountDue: routeClient.amountDue,
      });
    }
  };

  // Calcular progreso de cobros
  const totalClients = activeRoute?.clients.length || 0;
  const collectedClients = activeRoute?.clients.filter((c) => c.collected).length || 0;
  const progressPercent = totalClients > 0 ? (collectedClients / totalClients) * 100 : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Encabezado y Selección de Ruta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 font-[var(--font-heading)] tracking-tight">Rutas de Cobro en Campo</h2>
          <p className="text-sm text-slate-500 mt-1">Gestión de cartera móvil asignada a cobradores.</p>
        </div>

        <select
          value={activeRouteId}
          onChange={(e) => setActiveRouteId(e.target.value)}
          className="bg-slate-50 border border-slate-200 hover:border-blue-500/30 rounded-lg p-2.5 text-xs font-bold uppercase tracking-wider text-blue-600 min-w-[200px] focus:ring-2 focus:ring-blue-500/10 focus:border-blue-550 transition-all cursor-pointer outline-none"
        >
          {collectorRoutes.map((r) => (
            <option key={r.id} value={r.id}>
              Zona {r.zoneName}
            </option>
          ))}
        </select>
      </div>

      {activeRoute ? (
        <div className="space-y-6 relative z-10">
          {/* Tarjeta de Progreso de Cobro de la Ruta */}
          <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cobrador Asignado</span>
              <p className="text-sm font-bold text-slate-700">{activeRoute.collectorName}</p>
              <p className="text-xs text-slate-500 font-semibold">Zona: {activeRoute.zoneName}</p>
            </div>

            <div className="space-y-2.5 relative z-10">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <span>Progreso</span>
                <span>
                  {collectedClients} de {totalClients} cobrados ({progressPercent.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full border border-slate-200/50 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between md:justify-around gap-4 text-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 relative z-10">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cobrado</span>
                <p className="text-lg font-extrabold font-mono text-emerald-600 mt-1">
                  {formatRD(activeRoute.totalCollected)}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pendiente</span>
                <p className="text-lg font-extrabold font-mono text-amber-600 mt-1">
                  {formatRD(activeRoute.totalPending)}
                </p>
              </div>
            </div>
          </div>

          {/* Listado Mobile-First de Clientes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Clientes Asignados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRoute.clients.map((c) => (
                <RouteCard
                  key={c.clientId}
                  client={c}
                  routeId={activeRoute.id}
                  onLogPayment={handleOpenReceiptLog}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-400 italic text-sm">
          No hay rutas de cobro configuradas.
        </div>
      )}

      {/* Modal del Registrador de Recibos */}
      {selectedLogClient && activeRoute && (
        <ReceiptLogger
          clientId={selectedLogClient.id}
          clientName={selectedLogClient.name}
          amountDue={selectedLogClient.amountDue}
          routeId={activeRoute.id}
          onClose={() => setSelectedLogClient(null)}
        />
      )}
    </div>
  );
}
