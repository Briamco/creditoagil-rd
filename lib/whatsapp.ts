// =============================================================================
// CréditoÁgil RD — Plantilla de WhatsApp para Cobros
// =============================================================================

import { formatRD } from './currency';

/**
 * Normaliza un número telefónico dominicano al formato internacional.
 * Acepta formatos: "809-555-1234", "8095551234", "1809-555-1234", "+1-809-555-1234"
 * Retorna en formato: "18095551234" (sin el +)
 *
 * @param phone - Número telefónico en cualquier formato
 * @returns Número normalizado para uso en URL de WhatsApp
 */
function normalizePhone(phone: string): string {
  // Remover todo excepto dígitos
  const digits = phone.replace(/\D/g, '');

  // Si ya tiene código de país (1) + 10 dígitos
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits;
  }

  // Si tiene 10 dígitos (código de área + número)
  if (digits.length === 10) {
    return `1${digits}`;
  }

  // Si tiene 7 dígitos, asumir código de área 809
  if (digits.length === 7) {
    return `1809${digits}`;
  }

  // Retornar como está si no se puede normalizar
  return digits;
}

/**
 * Formatea una fecha en formato legible en español dominicano.
 * @param dateStr - Fecha en formato ISO string
 * @returns Fecha formateada (ej: "15 de julio de 2026")
 */
function formatDateSpanish(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Construye una URL de WhatsApp con un mensaje de recordatorio de pago
 * en español dominicano.
 *
 * @param phone - Número telefónico del cliente
 * @param clientName - Nombre del cliente
 * @param amount - Monto de la cuota pendiente
 * @param installmentNum - Número de cuota
 * @param dueDate - Fecha de vencimiento (ISO string)
 * @returns URL completa para abrir WhatsApp con el mensaje pre-llenado
 *
 * @example
 * const url = buildWhatsAppUrl(
 *   "809-555-1234",
 *   "Juan Pérez",
 *   5000,
 *   3,
 *   "2026-07-15"
 * );
 * // "https://wa.me/18095551234?text=Saludos%20Juan%20P%C3%A9rez..."
 */
export function buildWhatsAppUrl(
  phone: string,
  clientName: string,
  amount: number,
  installmentNum: number,
  dueDate: string,
): string {
  const normalizedPhone = normalizePhone(phone);
  const formattedAmount = formatRD(amount);
  const formattedDate = formatDateSpanish(dueDate);

  const message =
    `Saludos ${clientName}, le recordamos que su cuota #${installmentNum} ` +
    `de ${formattedAmount} con vencimiento ${formattedDate} se encuentra pendiente. ` +
    `Favor comunicarse con CréditoÁgil RD. Gracias.`;

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

/**
 * Construye una URL de WhatsApp con un mensaje de confirmación de pago.
 *
 * @param phone - Número telefónico del cliente
 * @param clientName - Nombre del cliente
 * @param amount - Monto pagado
 * @param receiptNumber - Número de recibo
 * @returns URL completa para abrir WhatsApp con el mensaje pre-llenado
 */
export function buildPaymentConfirmationUrl(
  phone: string,
  clientName: string,
  amount: number,
  receiptNumber: string,
): string {
  const normalizedPhone = normalizePhone(phone);
  const formattedAmount = formatRD(amount);

  const message =
    `Saludos ${clientName}, confirmamos su pago de ${formattedAmount}. ` +
    `Recibo No. ${receiptNumber}. ` +
    `Gracias por su puntualidad. CréditoÁgil RD.`;

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}
