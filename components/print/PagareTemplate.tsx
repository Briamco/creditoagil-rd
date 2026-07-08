'use client';

import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import { formatCedula } from '@/lib/cedula-validator';

interface PagareTemplateProps {
  loanId?: string;
}

// Helper simple para convertir montos a letras en español
function numberToWords(num: number): string {
  const rounded = Math.round(num);
  
  if (rounded === 150000) return 'CIENTO CINCUENTA MIL PESOS CON 00/100';
  if (rounded === 50000) return 'CINCUENTA MIL PESOS CON 00/100';
  if (rounded === 80000) return 'OCHENTA MIL PESOS CON 00/100';
  if (rounded === 15000) return 'QUINCE MIL PESOS CON 00/100';
  if (rounded === 100000) return 'CIEN MIL PESOS CON 00/100';
  
  return `${rounded.toLocaleString('es-DO')} PESOS CON 00/100`;
}

export default function PagareTemplate({ loanId }: PagareTemplateProps) {
  const { state } = useLoanSystem();
  const { loans, clients } = state;

  // Cargar préstamo seleccionado o por defecto el primero
  const loan = loanId 
    ? loans.find((l) => l.id === loanId)
    : loans[0];

  if (!loan) {
    return (
      <div className="p-8 text-center text-slate-500 italic">
        No se encontró ningún préstamo activo para generar el pagaré.
      </div>
    );
  }

  const client = clients.find((c) => c.id === loan.clientId);
  const guarantor = client?.coSigners[0]; // Tomar el primer fiador si existe

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const frequencyLabel = {
    daily: 'días',
    weekly: 'semanas',
    biweekly: 'quincenas',
    monthly: 'meses',
  }[loan.frequency];

  return (
    <div className="print-pagare bg-white text-black p-10 font-serif max-w-[800px] mx-auto border border-slate-350 shadow-lg text-sm leading-relaxed">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wider underline">PAGARÉ NOTARIAL</h1>
        <p className="text-xs text-slate-500">República Dominicana</p>
      </div>

      <div className="space-y-4 text-justify text-xs md:text-sm">
        <p>
          En la ciudad de Santo Domingo, Distrito Nacional, Capital de la República Dominicana, a los{' '}
          <span className="font-semibold">{dateStr}</span>.
        </p>

        <p>
          POR EL PRESENTE DOCUMENTO, yo, el abajo firmado, señor(a){' '}
          <span className="font-bold underline uppercase">{client ? `${client.firstName} ${client.lastName}` : '______________________'}</span>, 
          de nacionalidad dominicana, mayor de edad, de estado civil ______________, provisto(a) de la Cédula de Identidad y Electoral No.{' '}
          <span className="font-mono font-bold">{client ? formatCedula(client.cedula) : '___-_______-_'}</span>, 
          con domicilio y residencia en la calle{' '}
          <span className="font-medium">{client ? client.address : '____________________________________'}</span> de la ciudad de{' '}
          <span className="font-medium">{client ? client.city : '______________________'}</span>, 
          por medio del presente PAGARÉ de manera libre, formal y voluntaria:
        </p>

        <p className="font-bold uppercase bg-slate-50 p-3 border border-slate-200 rounded text-center my-4">
          PAGARÉ UNILATERALMENTE Y A LA ORDEN DE CRÉDITOÁGIL RD
        </p>

        <p>
          La suma de <span className="font-bold underline">{numberToWords(loan.amount)} RD$ ({formatRD(loan.amount)})</span>, 
          por concepto de un crédito otorgado en la fecha de hoy, la cual me obligo a pagar en un plazo de{' '}
          <span className="font-semibold">{loan.term} {frequencyLabel}</span>, mediante cuotas consecutivas devengando una tasa de interés mensual de{' '}
          <span className="font-semibold">{(loan.interestRate * 100).toFixed(1)}%</span>, pagaderas según la tabla de amortización adjunta.
        </p>

        <p>
          En caso de mora en el pago de cualquiera de las cuotas indicadas, se aplicará un recargo por mora equivalente al{' '}
          <span className="font-semibold">0.1% diario</span> sobre el saldo vencido e insoluto, sin necesidad de requerimiento judicial previo alguno.
        </p>

        {guarantor ? (
          <p>
            E interviene al presente acto, el(la) señor(a) <span className="font-bold uppercase underline">{guarantor.name}</span>, 
            provisto(a) de la Cédula de Identidad y Electoral No. <span className="font-mono font-bold">{formatCedula(guarantor.cedula)}</span>, 
            en su calidad de <span className="font-semibold">FIADOR SOLIDARIO E INDIVISIBLE</span>, obligándose a responder solidariamente de todas 
            las obligaciones asumidas por el deudor principal en este acto, renunciando formalmente a los beneficios de excusión y división.
          </p>
        ) : (
          <p className="italic text-slate-500">
            No habiendo fiador solidario interviniente, el deudor garantiza la presente deuda con todo su patrimonio presente y futuro, 
            afectando de manera especial los bienes muebles descritos en la sección de colaterales del contrato operativo.
          </p>
        )}

        <p>
          Para la ejecución de las obligaciones aquí descritas, las partes eligen domicilio en la ciudad de Santo Domingo y se someten a la jurisdicción de los tribunales correspondientes de dicho Distrito Judicial.
        </p>
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-2 gap-12 mt-16 text-center text-xs">
        <div className="space-y-12">
          <div className="border-b border-black w-48 mx-auto" />
          <div>
            <p className="font-bold uppercase">{client ? `${client.firstName} ${client.lastName}` : 'DEUDOR'}</p>
            <p className="text-[10px] text-slate-500 font-mono">Cédula: {client ? formatCedula(client.cedula) : ''}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">Deudor Principal</p>
          </div>
        </div>

        {guarantor ? (
          <div className="space-y-12">
            <div className="border-b border-black w-48 mx-auto" />
            <div>
              <p className="font-bold uppercase">{guarantor.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">Cédula: {formatCedula(guarantor.cedula)}</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-500">Fiador Solidario</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="border-b border-black w-48 mx-auto" />
            <div>
              <p className="font-bold uppercase">CRÉDITOÁGIL RD</p>
              <p className="text-[10px] text-slate-500">Acreedor Autorizado</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-500">Acreedor</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-20 pt-6 border-t border-slate-200 text-[10px] text-slate-400">
        Documento generado electrónicamente en CréditoÁgil RD. Válido para fines demostrativos de simulación de crédito.
      </div>
    </div>
  );
}
