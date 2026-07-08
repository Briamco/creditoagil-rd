// =============================================================================
// CréditoÁgil RD — Formateo de Moneda (Peso Dominicano)
// =============================================================================

/**
 * Formateador de moneda para Peso Dominicano (DOP).
 * Usa Intl.NumberFormat con la localidad 'es-DO'.
 */
const dopFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un número como moneda dominicana: RD$XX,XXX.XX
 *
 * @param amount - Monto a formatear
 * @returns Cadena formateada con el símbolo RD$
 *
 * @example
 * formatRD(50000)    // "RD$50,000.00"
 * formatRD(1234.5)   // "RD$1,234.50"
 * formatRD(0)        // "RD$0.00"
 */
export function formatRD(amount: number): string {
  // Intl.NumberFormat para es-DO puede usar "RD$" o "DOP" dependiendo del entorno.
  // Normalizamos para siempre usar "RD$" como prefijo.
  const formatted = dopFormatter.format(amount);

  // Reemplazar posibles variaciones del formato para consistencia
  // Algunos entornos pueden generar "DOP 50,000.00" o "RD$ 50,000.00"
  const normalized = formatted
    .replace(/^DOP\s*/, 'RD$')
    .replace(/^RD\$\s*/, 'RD$');

  return normalized;
}

/**
 * Parsea una cadena formateada como moneda dominicana a un número.
 * Acepta formatos como: "RD$50,000.00", "RD$ 50,000.00", "50,000.00", "50000"
 *
 * @param formatted - Cadena con monto formateado
 * @returns Número parseado
 *
 * @example
 * parseRD("RD$50,000.00")  // 50000
 * parseRD("RD$ 1,234.50")  // 1234.5
 * parseRD("50,000")         // 50000
 */
export function parseRD(formatted: string): number {
  // Remover el prefijo RD$, DOP, espacios, y comas
  const cleaned = formatted
    .replace(/^RD\$\s*/, '')
    .replace(/^DOP\s*/, '')
    .replace(/,/g, '')
    .trim();

  const result = parseFloat(cleaned);

  if (isNaN(result)) {
    return 0;
  }

  return result;
}

/**
 * Formatea un número como moneda compacta para mostrar en tablas.
 * Para montos >= 1,000,000 usa "M", para >= 1,000 usa "K".
 *
 * @param amount - Monto a formatear
 * @returns Cadena formateada compacta
 *
 * @example
 * formatRDCompact(1500000) // "RD$1.5M"
 * formatRDCompact(50000)   // "RD$50K"
 * formatRDCompact(500)     // "RD$500.00"
 */
export function formatRDCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `RD$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `RD$${(amount / 1_000).toFixed(0)}K`;
  }
  return formatRD(amount);
}
