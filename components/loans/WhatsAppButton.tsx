'use client';

import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface WhatsAppButtonProps {
  phone: string;
  clientName: string;
  amount: number;
  installmentNum: number;
  dueDate: string;
  size?: 'sm' | 'md';
}

export default function WhatsAppButton({
  phone,
  clientName,
  amount,
  installmentNum,
  dueDate,
  size = 'md',
}: WhatsAppButtonProps) {
  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar click en la fila de la tabla
    const url = buildWhatsAppUrl(phone, clientName, amount, installmentNum, dueDate);
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleOpenWhatsApp}
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-lg font-bold uppercase tracking-wider
        bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 hover:scale-105 cursor-pointer
        ${size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-2 text-xs'}
      `}
      title="Enviar recordatorio por WhatsApp"
    >
      <span>WhatsApp</span>
    </button>
  );
}
