// =============================================================================
// CréditoÁgil RD — Motores de Cálculo de Amortización
// =============================================================================
// Soporta:
// - Amortización Francesa (cuota fija): cuota = P * [r(1+r)^n] / [(1+r)^n - 1]
// - Interés Simple (método "San"): interés calculado sobre el capital original
//
// Ambos métodos ajustan las fechas de vencimiento para caer en días laborables
// dominicanos (no feriados, no fines de semana).
// =============================================================================

import type { Installment, PaymentFrequency } from '@/types';
import { nextBusinessDay } from './dominican-holidays';

/**
 * Convierte una tasa mensual a la tasa por período según la frecuencia.
 *
 * @param monthlyRate - Tasa de interés mensual (ej: 0.03 = 3%)
 * @param frequency - Frecuencia de pago
 * @returns Tasa por período
 */
export function getPeriodRate(monthlyRate: number, frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'daily':
      // Tasa mensual / 30 (promedio de días por mes)
      return monthlyRate / 30;
    case 'weekly':
      // Tasa mensual * 12 / 52
      return (monthlyRate * 12) / 52;
    case 'biweekly':
      // Tasa mensual * 12 / 26
      return (monthlyRate * 12) / 26;
    case 'monthly':
      return monthlyRate;
    default:
      return monthlyRate;
  }
}

/**
 * Obtiene el número de días calendario entre cuotas según la frecuencia.
 *
 * @param frequency - Frecuencia de pago
 * @returns Días entre cuotas
 */
function getFrequencyDays(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'daily':
      return 1;
    case 'weekly':
      return 7;
    case 'biweekly':
      return 14;
    case 'monthly':
      return 30;
    default:
      return 30;
  }
}

/**
 * Calcula la siguiente fecha de vencimiento a partir de una fecha base,
 * avanzando según la frecuencia y ajustando a día laborable.
 *
 * @param baseDate - Fecha base
 * @param periodNumber - Número de período (1-indexed)
 * @param frequency - Frecuencia de pago
 * @returns Fecha de vencimiento ajustada a día laborable
 */
function calculateDueDate(baseDate: Date, periodNumber: number, frequency: PaymentFrequency): Date {
  const dueDate = new Date(baseDate);

  if (frequency === 'monthly') {
    // Para mensual, avanzar meses completos para preservar el día del mes
    dueDate.setMonth(dueDate.getMonth() + periodNumber);
  } else {
    const days = getFrequencyDays(frequency);
    dueDate.setDate(dueDate.getDate() + days * periodNumber);
  }

  // Ajustar a día laborable (si cae en fin de semana o feriado)
  return nextBusinessDay(dueDate);
}

/**
 * Redondea un número a 2 decimales para valores monetarios.
 */
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

// =============================================================================
// Amortización Francesa (Cuota Fija)
// =============================================================================

/**
 * Calcula la tabla de amortización usando el sistema francés (cuota fija).
 *
 * Fórmula de cuota fija:
 *   cuota = P * [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Donde:
 * - P = capital (principal)
 * - r = tasa de interés por período
 * - n = número total de períodos
 *
 * En cada período:
 * - interés = balance_restante * tasa_período
 * - capital = cuota - interés
 * - balance = balance_anterior - capital
 *
 * @param principal - Monto del préstamo en RD$
 * @param monthlyRate - Tasa de interés mensual (ej: 0.03 = 3%)
 * @param termInPeriods - Número total de cuotas
 * @param frequency - Frecuencia de pago
 * @param startDate - Fecha de desembolso
 * @returns Array de cuotas calculadas
 */
export function calculateFrenchAmortization(
  principal: number,
  monthlyRate: number,
  termInPeriods: number,
  frequency: PaymentFrequency,
  startDate: Date,
): Installment[] {
  const periodRate = getPeriodRate(monthlyRate, frequency);
  const installments: Installment[] = [];

  // Cuota fija: P * [r(1+r)^n] / [(1+r)^n - 1]
  let fixedPayment: number;
  if (periodRate === 0) {
    fixedPayment = principal / termInPeriods;
  } else {
    const factor = Math.pow(1 + periodRate, termInPeriods);
    fixedPayment = principal * (periodRate * factor) / (factor - 1);
  }
  fixedPayment = roundMoney(fixedPayment);

  let remainingBalance = principal;

  for (let i = 1; i <= termInPeriods; i++) {
    const dueDate = calculateDueDate(startDate, i, frequency);
    const interest = roundMoney(remainingBalance * periodRate);

    let principalPayment: number;
    if (i === termInPeriods) {
      // Última cuota: ajustar para cubrir el balance restante exacto
      principalPayment = roundMoney(remainingBalance);
    } else {
      principalPayment = roundMoney(fixedPayment - interest);
    }

    remainingBalance = roundMoney(remainingBalance - principalPayment);

    // Ajustar el pago total en la última cuota
    const totalPayment = i === termInPeriods
      ? roundMoney(principalPayment + interest)
      : fixedPayment;

    // Asegurar que el balance no quede negativo por redondeo
    if (remainingBalance < 0) {
      remainingBalance = 0;
    }

    installments.push({
      number: i,
      dueDate: dueDate.toISOString(),
      principal: principalPayment,
      interest,
      lateFee: 0,
      totalPayment,
      remainingBalance,
      status: 'pending',
      paidAmount: 0,
      paidDate: null,
    });
  }

  return installments;
}

// =============================================================================
// Interés Simple (Método "San" — Interés Plano)
// =============================================================================

/**
 * Calcula la tabla de amortización usando interés simple (método "San").
 *
 * En este método:
 * - El capital se divide en partes iguales: capital_cuota = P / n
 * - El interés se calcula sobre el CAPITAL ORIGINAL (no sobre el balance):
 *   interés_cuota = P * tasa_período (constante en cada cuota)
 * - Cuota total = capital_cuota + interés_cuota (constante)
 *
 * Este es el método más común en las financieras dominicanas ("prestamistas")
 * por su simplicidad de cálculo y explicación al cliente.
 *
 * @param principal - Monto del préstamo en RD$
 * @param monthlyRate - Tasa de interés mensual (ej: 0.03 = 3%)
 * @param termInPeriods - Número total de cuotas
 * @param frequency - Frecuencia de pago
 * @param startDate - Fecha de desembolso
 * @returns Array de cuotas calculadas
 */
export function calculateSimpleInterest(
  principal: number,
  monthlyRate: number,
  termInPeriods: number,
  frequency: PaymentFrequency,
  startDate: Date,
): Installment[] {
  const periodRate = getPeriodRate(monthlyRate, frequency);
  const installments: Installment[] = [];

  // Capital constante por cuota
  const principalPerPeriod = roundMoney(principal / termInPeriods);

  // Interés constante calculado sobre el capital original (método San)
  const interestPerPeriod = roundMoney(principal * periodRate);

  let remainingBalance = principal;

  for (let i = 1; i <= termInPeriods; i++) {
    const dueDate = calculateDueDate(startDate, i, frequency);

    let principalPayment: number;
    if (i === termInPeriods) {
      // Última cuota: ajustar para cubrir el balance restante exacto
      principalPayment = roundMoney(remainingBalance);
    } else {
      principalPayment = principalPerPeriod;
    }

    remainingBalance = roundMoney(remainingBalance - principalPayment);

    if (remainingBalance < 0) {
      remainingBalance = 0;
    }

    const totalPayment = roundMoney(principalPayment + interestPerPeriod);

    installments.push({
      number: i,
      dueDate: dueDate.toISOString(),
      principal: principalPayment,
      interest: interestPerPeriod,
      lateFee: 0,
      totalPayment,
      remainingBalance,
      status: 'pending',
      paidAmount: 0,
      paidDate: null,
    });
  }

  return installments;
}

// =============================================================================
// Cálculo de Mora (Late Fee)
// =============================================================================

/**
 * Calcula la mora por atraso en el pago de una cuota.
 *
 * Fórmula: mora = tasa_diaria * días_atraso * balance_pendiente
 *
 * La tasa diaria se calcula como: tasa_mensual / 30
 *
 * @param monthlyRate - Tasa de interés mensual del préstamo
 * @param daysLate - Días de atraso
 * @param remainingBalance - Balance pendiente de la cuota
 * @returns Monto de mora en RD$
 */
export function calculateLateFee(
  monthlyRate: number,
  daysLate: number,
  remainingBalance: number,
): number {
  if (daysLate <= 0 || remainingBalance <= 0) {
    return 0;
  }

  const dailyRate = monthlyRate / 30;
  return roundMoney(dailyRate * daysLate * remainingBalance);
}

// =============================================================================
// Utilidades
// =============================================================================

/**
 * Calcula el resumen total de un préstamo basado en su tabla de amortización.
 *
 * @param installments - Tabla de amortización
 * @returns Resumen con totales de capital, interés y pagos
 */
export function calculateLoanSummary(installments: Installment[]): {
  totalPrincipal: number;
  totalInterest: number;
  totalPayments: number;
  totalLateFees: number;
} {
  return installments.reduce(
    (summary, inst) => ({
      totalPrincipal: roundMoney(summary.totalPrincipal + inst.principal),
      totalInterest: roundMoney(summary.totalInterest + inst.interest),
      totalPayments: roundMoney(summary.totalPayments + inst.totalPayment),
      totalLateFees: roundMoney(summary.totalLateFees + inst.lateFee),
    }),
    { totalPrincipal: 0, totalInterest: 0, totalPayments: 0, totalLateFees: 0 },
  );
}
