'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PagareTemplate from '@/components/print/PagareTemplate';

function PagarePrintContent() {
  const searchParams = useSearchParams();
  const loanId = searchParams.get('loanId') || undefined;

  useEffect(() => {
    // Retrasar ligeramente la impresión para asegurar el renderizado
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, [loanId]);

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col items-center justify-start">
      <div className="no-print mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 text-xs flex items-center justify-between gap-3 w-full max-w-4xl">
        <span>Generando pagaré notarial (A4)... Presione <b>Ctrl + P</b> si el cuadro de diálogo no abre automáticamente.</span>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition-colors text-[11px] uppercase tracking-wider cursor-pointer"
        >
          Imprimir
        </button>
      </div>

      <PagareTemplate loanId={loanId} />
    </div>
  );
}

export default function PagarePrintPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 italic">Cargando pagaré...</div>}>
      <PagarePrintContent />
    </Suspense>
  );
}
