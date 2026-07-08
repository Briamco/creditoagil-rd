'use client';

// =============================================================================
// CréditoÁgil RD — Contexto Centralizado del Sistema de Préstamos
// =============================================================================
// Provee estado global con React Context + useReducer.
// Persiste en localStorage y se carga al montar.
// Incluye datos semilla realistas con clientes dominicanos, préstamos activos,
// transacciones de caja, y rutas de cobro.
// =============================================================================

import React, { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import type {
  LoanSystemState,
  Client,
  Loan,
  Payment,
  CashTransaction,
  Expense,
  BankDeposit,
  CollectorRoute,
  UserRole,
  Installment,
} from '@/types';
import {
  calculateFrenchAmortization,
  calculateSimpleInterest,
} from '@/lib/amortization';

// =============================================================================
// Constantes
// =============================================================================

const STORAGE_KEY = 'creditoagil-rd-state';

// =============================================================================
// Datos Semilla — Clientes Dominicanos
// =============================================================================

const SEED_CLIENTS: Client[] = [
  {
    id: 'CLI-001',
    cedula: '001-1234567-8',
    firstName: 'Juan Carlos',
    lastName: 'Méndez Reyes',
    phone: '809-555-0101',
    address: 'Calle El Conde #45, Zona Colonial',
    city: 'Santo Domingo',
    riskStatus: 'al_dia',
    coSigners: [
      {
        name: 'María Elena Reyes de Méndez',
        cedula: '001-7654321-0',
        phone: '809-555-0102',
        relationship: 'Esposa',
      },
    ],
    collateral: [
      {
        type: 'Vehículo',
        description: 'Toyota Corolla 2020, color gris, placa A123456',
        estimatedValue: 850000,
      },
    ],
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'CLI-002',
    cedula: '031-0987654-3',
    firstName: 'Rosa María',
    lastName: 'Santana Durán',
    phone: '829-555-0201',
    address: 'Av. Estrella Sadhalá #120, Los Jardines',
    city: 'Santiago de los Caballeros',
    riskStatus: 'al_dia',
    coSigners: [
      {
        name: 'Pedro Antonio Santana',
        cedula: '031-1122334-5',
        phone: '829-555-0202',
        relationship: 'Hermano',
      },
    ],
    collateral: [
      {
        type: 'Electrodoméstico',
        description: 'Nevera Samsung French Door, TV 65" LG',
        estimatedValue: 95000,
      },
    ],
    createdAt: '2026-02-20T14:30:00.000Z',
  },
  {
    id: 'CLI-003',
    cedula: '025-5566778-1',
    firstName: 'Miguel Ángel',
    lastName: 'Polanco Tejada',
    phone: '849-555-0301',
    address: 'Calle Sánchez #78, Centro',
    city: 'La Vega',
    riskStatus: 'atraso_1_15',
    coSigners: [],
    collateral: [
      {
        type: 'Motocicleta',
        description: 'Honda CG 150 2023, color negro',
        estimatedValue: 120000,
      },
    ],
    createdAt: '2026-03-10T09:15:00.000Z',
  },
  {
    id: 'CLI-004',
    cedula: '054-2233445-6',
    firstName: 'Yolanda',
    lastName: 'García Almonte',
    phone: '809-555-0401',
    address: 'Av. Malecón #33, Sector Long Beach',
    city: 'Puerto Plata',
    riskStatus: 'moroso',
    coSigners: [
      {
        name: 'Carlos Manuel García',
        cedula: '054-6677889-0',
        phone: '809-555-0402',
        relationship: 'Padre',
      },
    ],
    collateral: [
      {
        type: 'Inmueble',
        description: 'Solar de 200m² en Villa Progreso, título deslindado',
        estimatedValue: 450000,
      },
    ],
    createdAt: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'CLI-005',
    cedula: '028-8899001-2',
    firstName: 'Fernando José',
    lastName: 'De la Cruz Peña',
    phone: '829-555-0501',
    address: 'Calle Padre Billini #90, Madre Vieja Sur',
    city: 'San Cristóbal',
    riskStatus: 'al_dia',
    coSigners: [
      {
        name: 'Ana Luisa Peña Vda. De la Cruz',
        cedula: '028-4455667-8',
        phone: '829-555-0502',
        relationship: 'Madre',
      },
    ],
    collateral: [
      {
        type: 'Vehículo',
        description: 'Hyundai Tucson 2022, color blanco, placa G789012',
        estimatedValue: 1200000,
      },
    ],
    createdAt: '2026-04-01T11:45:00.000Z',
  },
];

// =============================================================================
// Datos Semilla — Préstamos con Tablas de Amortización Pre-calculadas
// =============================================================================

/**
 * Genera los préstamos semilla con sus tablas de amortización.
 * Se usa una función para evitar problemas con imports circulares
 * y para que las fechas sean relativas al momento de ejecución.
 */
function generateSeedLoans(): Loan[] {
  // Préstamo 1: Francés Mensual — Juan Carlos Méndez
  // RD$150,000 al 3% mensual, 12 cuotas mensuales
  const loan1Installments = calculateFrenchAmortization(
    150000,
    0.03,
    12,
    'monthly',
    new Date('2026-05-01'),
  );
  // Marcar las primeras 2 cuotas como pagadas
  loan1Installments[0].status = 'paid';
  loan1Installments[0].paidAmount = loan1Installments[0].totalPayment;
  loan1Installments[0].paidDate = '2026-06-02T10:30:00.000Z';
  loan1Installments[1].status = 'paid';
  loan1Installments[1].paidAmount = loan1Installments[1].totalPayment;
  loan1Installments[1].paidDate = '2026-07-01T09:15:00.000Z';

  // Préstamo 2: Interés Simple Semanal — Rosa María Santana
  // RD$50,000 al 4% mensual, 16 cuotas semanales
  const loan2Installments = calculateSimpleInterest(
    50000,
    0.04,
    16,
    'weekly',
    new Date('2026-06-01'),
  );
  // Marcar las primeras 4 cuotas como pagadas
  for (let i = 0; i < 4; i++) {
    loan2Installments[i].status = 'paid';
    loan2Installments[i].paidAmount = loan2Installments[i].totalPayment;
    const paidDate = new Date('2026-06-08');
    paidDate.setDate(paidDate.getDate() + i * 7);
    loan2Installments[i].paidDate = paidDate.toISOString();
  }

  // Préstamo 3: Francés Quincenal — Miguel Ángel Polanco
  // RD$80,000 al 3.5% mensual, 8 cuotas quincenales
  const loan3Installments = calculateFrenchAmortization(
    80000,
    0.035,
    8,
    'biweekly',
    new Date('2026-05-15'),
  );
  // Marcar la primera cuota como pagada y la segunda como vencida
  loan3Installments[0].status = 'paid';
  loan3Installments[0].paidAmount = loan3Installments[0].totalPayment;
  loan3Installments[0].paidDate = '2026-05-30T14:00:00.000Z';
  loan3Installments[1].status = 'overdue';
  loan3Installments[1].lateFee = 350;
  loan3Installments[1].totalPayment += 350;

  return [
    {
      id: 'LN-001',
      clientId: 'CLI-001',
      amount: 150000,
      interestRate: 0.03,
      term: 12,
      frequency: 'monthly',
      amortizationType: 'french',
      status: 'active',
      installments: loan1Installments,
      disbursementDate: '2026-05-01T08:00:00.000Z',
      createdBy: 'Admin',
    },
    {
      id: 'LN-002',
      clientId: 'CLI-002',
      amount: 50000,
      interestRate: 0.04,
      term: 16,
      frequency: 'weekly',
      amortizationType: 'simple',
      status: 'active',
      installments: loan2Installments,
      disbursementDate: '2026-06-01T10:00:00.000Z',
      createdBy: 'Credit_Officer',
    },
    {
      id: 'LN-003',
      clientId: 'CLI-003',
      amount: 80000,
      interestRate: 0.035,
      term: 8,
      frequency: 'biweekly',
      amortizationType: 'french',
      status: 'active',
      installments: loan3Installments,
      disbursementDate: '2026-05-15T09:00:00.000Z',
      createdBy: 'Admin',
    },
  ];
}

// =============================================================================
// Datos Semilla — Pagos
// =============================================================================

const SEED_PAYMENTS: Payment[] = [
  {
    id: 'PAY-001',
    loanId: 'LN-001',
    clientId: 'CLI-001',
    installmentNumber: 1,
    amount: 14520.93,
    paymentType: 'regular',
    receiptNumber: 'REC-2026-0001',
    receivedBy: 'Cashier',
    date: '2026-06-02T10:30:00.000Z',
  },
  {
    id: 'PAY-002',
    loanId: 'LN-001',
    clientId: 'CLI-001',
    installmentNumber: 2,
    amount: 14520.93,
    paymentType: 'regular',
    receiptNumber: 'REC-2026-0002',
    receivedBy: 'Cashier',
    date: '2026-07-01T09:15:00.000Z',
  },
  {
    id: 'PAY-003',
    loanId: 'LN-002',
    clientId: 'CLI-002',
    installmentNumber: 1,
    amount: 4259.62,
    paymentType: 'regular',
    receiptNumber: 'REC-2026-0003',
    receivedBy: 'Collector',
    date: '2026-06-08T11:00:00.000Z',
  },
  {
    id: 'PAY-004',
    loanId: 'LN-002',
    clientId: 'CLI-002',
    installmentNumber: 2,
    amount: 4259.62,
    paymentType: 'regular',
    receiptNumber: 'REC-2026-0004',
    receivedBy: 'Collector',
    date: '2026-06-15T10:45:00.000Z',
  },
  {
    id: 'PAY-005',
    loanId: 'LN-002',
    clientId: 'CLI-002',
    installmentNumber: 3,
    amount: 4259.62,
    paymentType: 'regular',
    receiptNumber: 'REC-2026-0005',
    receivedBy: 'Collector',
    date: '2026-06-22T11:30:00.000Z',
  },
  {
    id: 'PAY-006',
    loanId: 'LN-002',
    clientId: 'CLI-002',
    installmentNumber: 4,
    amount: 4259.62,
    paymentType: 'regular',
    receiptNumber: 'REC-2026-0006',
    receivedBy: 'Cashier',
    date: '2026-06-29T09:00:00.000Z',
  },
  {
    id: 'PAY-007',
    loanId: 'LN-003',
    clientId: 'CLI-003',
    installmentNumber: 1,
    amount: 11307.73,
    paymentType: 'regular',
    receiptNumber: 'REC-2026-0007',
    receivedBy: 'Cashier',
    date: '2026-05-30T14:00:00.000Z',
  },
];

// =============================================================================
// Datos Semilla — Transacciones de Caja (15+ entradas, últimos 30 días)
// =============================================================================

const SEED_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'CT-001',
    type: 'income',
    description: 'Cobro cuota #1 préstamo LN-001 — Juan Carlos Méndez',
    amount: 14520.93,
    category: 'Cobro de Préstamo',
    date: '2026-06-02T10:30:00.000Z',
    processedBy: 'Cashier',
  },
  {
    id: 'CT-002',
    type: 'expense',
    description: 'Compra de papel bond y tóner para impresora',
    amount: 3500,
    category: 'Material de Oficina',
    date: '2026-06-03T08:45:00.000Z',
    processedBy: 'Admin',
  },
  {
    id: 'CT-003',
    type: 'income',
    description: 'Cobro cuota #1 préstamo LN-002 — Rosa María Santana',
    amount: 4259.62,
    category: 'Cobro de Préstamo',
    date: '2026-06-08T11:00:00.000Z',
    processedBy: 'Collector',
  },
  {
    id: 'CT-004',
    type: 'deposit',
    description: 'Depósito diario a Banreservas — cuenta operativa',
    amount: 18000,
    category: 'Depósito Bancario',
    date: '2026-06-08T15:00:00.000Z',
    processedBy: 'Cashier',
  },
  {
    id: 'CT-005',
    type: 'expense',
    description: 'Pago electricidad oficina — EDENORTE',
    amount: 8500,
    category: 'Servicios Públicos',
    date: '2026-06-10T09:00:00.000Z',
    processedBy: 'Admin',
  },
  {
    id: 'CT-006',
    type: 'income',
    description: 'Cobro cuota #2 préstamo LN-002 — Rosa María Santana',
    amount: 4259.62,
    category: 'Cobro de Préstamo',
    date: '2026-06-15T10:45:00.000Z',
    processedBy: 'Collector',
  },
  {
    id: 'CT-007',
    type: 'expense',
    description: 'Combustible para vehículo de cobro — Zona Norte',
    amount: 4000,
    category: 'Transporte',
    date: '2026-06-16T07:30:00.000Z',
    processedBy: 'Collector',
  },
  {
    id: 'CT-008',
    type: 'deposit',
    description: 'Depósito semanal a Banco Popular — cuenta principal',
    amount: 25000,
    category: 'Depósito Bancario',
    date: '2026-06-16T14:30:00.000Z',
    processedBy: 'Admin',
  },
  {
    id: 'CT-009',
    type: 'income',
    description: 'Cobro cuota #3 préstamo LN-002 — Rosa María Santana',
    amount: 4259.62,
    category: 'Cobro de Préstamo',
    date: '2026-06-22T11:30:00.000Z',
    processedBy: 'Collector',
  },
  {
    id: 'CT-010',
    type: 'expense',
    description: 'Almuerzo equipo de cobranza — Reunión mensual',
    amount: 2800,
    category: 'Alimentación',
    date: '2026-06-23T12:30:00.000Z',
    processedBy: 'Admin',
  },
  {
    id: 'CT-011',
    type: 'income',
    description: 'Cobro cuota #4 préstamo LN-002 — Rosa María Santana',
    amount: 4259.62,
    category: 'Cobro de Préstamo',
    date: '2026-06-29T09:00:00.000Z',
    processedBy: 'Cashier',
  },
  {
    id: 'CT-012',
    type: 'expense',
    description: 'Pago internet fibra óptica — Altice',
    amount: 3200,
    category: 'Servicios Públicos',
    date: '2026-06-29T10:00:00.000Z',
    processedBy: 'Admin',
  },
  {
    id: 'CT-013',
    type: 'income',
    description: 'Cobro cuota #2 préstamo LN-001 — Juan Carlos Méndez',
    amount: 14520.93,
    category: 'Cobro de Préstamo',
    date: '2026-07-01T09:15:00.000Z',
    processedBy: 'Cashier',
  },
  {
    id: 'CT-014',
    type: 'deposit',
    description: 'Depósito a BHD — fondo de reserva',
    amount: 30000,
    category: 'Depósito Bancario',
    date: '2026-07-01T16:00:00.000Z',
    processedBy: 'Admin',
  },
  {
    id: 'CT-015',
    type: 'income',
    description: 'Cobro cuota #1 préstamo LN-003 — Miguel Ángel Polanco',
    amount: 11307.73,
    category: 'Cobro de Préstamo',
    date: '2026-05-30T14:00:00.000Z',
    processedBy: 'Cashier',
  },
  {
    id: 'CT-016',
    type: 'expense',
    description: 'Mantenimiento aire acondicionado oficina',
    amount: 5500,
    category: 'Mantenimiento',
    date: '2026-07-03T10:00:00.000Z',
    processedBy: 'Admin',
  },
  {
    id: 'CT-017',
    type: 'expense',
    description: 'Compra de talonarios de recibos (500 unidades)',
    amount: 1800,
    category: 'Material de Oficina',
    date: '2026-07-05T08:30:00.000Z',
    processedBy: 'Cashier',
  },
];

// =============================================================================
// Datos Semilla — Gastos
// =============================================================================

const SEED_EXPENSES: Expense[] = [
  {
    id: 'EXP-001',
    description: 'Compra de papel bond y tóner para impresora',
    amount: 3500,
    category: 'Material de Oficina',
    date: '2026-06-03T08:45:00.000Z',
    registeredBy: 'Admin',
  },
  {
    id: 'EXP-002',
    description: 'Pago electricidad oficina — EDENORTE',
    amount: 8500,
    category: 'Servicios Públicos',
    date: '2026-06-10T09:00:00.000Z',
    registeredBy: 'Admin',
  },
  {
    id: 'EXP-003',
    description: 'Combustible para vehículo de cobro — Zona Norte',
    amount: 4000,
    category: 'Transporte',
    date: '2026-06-16T07:30:00.000Z',
    registeredBy: 'Collector',
  },
  {
    id: 'EXP-004',
    description: 'Almuerzo equipo de cobranza — Reunión mensual',
    amount: 2800,
    category: 'Alimentación',
    date: '2026-06-23T12:30:00.000Z',
    registeredBy: 'Admin',
  },
  {
    id: 'EXP-005',
    description: 'Pago internet fibra óptica — Altice',
    amount: 3200,
    category: 'Servicios Públicos',
    date: '2026-06-29T10:00:00.000Z',
    registeredBy: 'Admin',
  },
  {
    id: 'EXP-006',
    description: 'Mantenimiento aire acondicionado oficina',
    amount: 5500,
    category: 'Mantenimiento',
    date: '2026-07-03T10:00:00.000Z',
    registeredBy: 'Admin',
  },
  {
    id: 'EXP-007',
    description: 'Compra de talonarios de recibos (500 unidades)',
    amount: 1800,
    category: 'Material de Oficina',
    date: '2026-07-05T08:30:00.000Z',
    registeredBy: 'Cashier',
  },
];

// =============================================================================
// Datos Semilla — Depósitos Bancarios
// =============================================================================

const SEED_BANK_DEPOSITS: BankDeposit[] = [
  {
    id: 'DEP-001',
    bank: 'banreservas',
    amount: 18000,
    referenceNumber: 'BR-2026-0608-001',
    date: '2026-06-08T15:00:00.000Z',
    depositedBy: 'Cashier',
  },
  {
    id: 'DEP-002',
    bank: 'banco_popular',
    amount: 25000,
    referenceNumber: 'BP-2026-0616-001',
    date: '2026-06-16T14:30:00.000Z',
    depositedBy: 'Admin',
  },
  {
    id: 'DEP-003',
    bank: 'bhd',
    amount: 30000,
    referenceNumber: 'BHD-2026-0701-001',
    date: '2026-07-01T16:00:00.000Z',
    depositedBy: 'Admin',
  },
];

// =============================================================================
// Datos Semilla — Rutas de Cobro
// =============================================================================

const SEED_COLLECTOR_ROUTES: CollectorRoute[] = [
  {
    id: 'RT-001',
    collectorName: 'Ramón Alberto Peña',
    zoneName: 'Zona Colonial — Santo Domingo',
    date: '2026-07-07T07:00:00.000Z',
    clients: [
      {
        clientId: 'CLI-001',
        clientName: 'Juan Carlos Méndez Reyes',
        cedula: '001-1234567-8',
        address: 'Calle El Conde #45, Zona Colonial',
        amountDue: 14520.93,
        daysOverdue: 0,
        collected: false,
        receiptLogged: false,
      },
      {
        clientId: 'CLI-004',
        clientName: 'Yolanda García Almonte',
        cedula: '054-2233445-6',
        address: 'Av. Malecón #33, Sector Long Beach',
        amountDue: 25000,
        daysOverdue: 45,
        collected: false,
        receiptLogged: false,
      },
    ],
    totalCollected: 0,
    totalPending: 39520.93,
  },
  {
    id: 'RT-002',
    collectorName: 'Luis Emilio Castillo',
    zoneName: 'Santiago Centro — Cibao',
    date: '2026-07-07T07:30:00.000Z',
    clients: [
      {
        clientId: 'CLI-002',
        clientName: 'Rosa María Santana Durán',
        cedula: '031-0987654-3',
        address: 'Av. Estrella Sadhalá #120, Los Jardines',
        amountDue: 4259.62,
        daysOverdue: 0,
        collected: false,
        receiptLogged: false,
      },
      {
        clientId: 'CLI-003',
        clientName: 'Miguel Ángel Polanco Tejada',
        cedula: '025-5566778-1',
        address: 'Calle Sánchez #78, Centro',
        amountDue: 11657.73,
        daysOverdue: 8,
        collected: false,
        receiptLogged: false,
      },
      {
        clientId: 'CLI-005',
        clientName: 'Fernando José De la Cruz Peña',
        cedula: '028-8899001-2',
        address: 'Calle Padre Billini #90, Madre Vieja Sur',
        amountDue: 0,
        daysOverdue: 0,
        collected: false,
        receiptLogged: false,
      },
    ],
    totalCollected: 0,
    totalPending: 15917.35,
  },
];

// =============================================================================
// Estado Inicial
// =============================================================================

function createInitialState(): LoanSystemState {
  return {
    clients: SEED_CLIENTS,
    loans: generateSeedLoans(),
    payments: SEED_PAYMENTS,
    cashTransactions: SEED_CASH_TRANSACTIONS,
    expenses: SEED_EXPENSES,
    bankDeposits: SEED_BANK_DEPOSITS,
    collectorRoutes: SEED_COLLECTOR_ROUTES,
    currentRole: 'Admin',
    currentUser: 'Administrador',
  };
}

// =============================================================================
// Acciones del Reducer
// =============================================================================

type LoanSystemAction =
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'MAKE_PAYMENT'; payload: Payment }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'ADD_DEPOSIT'; payload: BankDeposit }
  | { type: 'SWITCH_ROLE'; payload: { role: UserRole; userName: string } }
  | { type: 'LOG_RECEIPT'; payload: { routeId: string; clientId: string; receiptNumber: string } }
  | { type: 'RESET_DATA' }
  | { type: 'LOAD_STATE'; payload: LoanSystemState };

// =============================================================================
// Reducer
// =============================================================================

function loanSystemReducer(state: LoanSystemState, action: LoanSystemAction): LoanSystemState {
  switch (action.type) {
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload],
      };

    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };

    case 'ADD_LOAN': {
      return {
        ...state,
        loans: [...state.loans, action.payload],
      };
    }

    case 'MAKE_PAYMENT': {
      const payment = action.payload;

      // Registrar el pago
      const updatedPayments = [...state.payments, payment];

      // Actualizar la cuota correspondiente en el préstamo
      const updatedLoans = state.loans.map((loan) => {
        if (loan.id !== payment.loanId) return loan;

        const updatedInstallments = loan.installments.map((inst) => {
          if (inst.number !== payment.installmentNumber) return inst;

          const newPaidAmount = inst.paidAmount + payment.amount;
          const isFullyPaid = newPaidAmount >= inst.totalPayment;

          return {
            ...inst,
            paidAmount: newPaidAmount,
            paidDate: payment.date,
            status: isFullyPaid ? 'paid' as const : 'partial' as const,
          };
        });

        // Verificar si todas las cuotas están pagadas
        const allPaid = updatedInstallments.every((inst) => inst.status === 'paid');

        return {
          ...loan,
          installments: updatedInstallments,
          status: allPaid ? 'paid' as const : loan.status,
        };
      });

      // Registrar como transacción de caja (ingreso)
      const cashTransaction: CashTransaction = {
        id: `CT-AUTO-${Date.now()}`,
        type: 'income',
        description: `Cobro cuota #${payment.installmentNumber} — Recibo ${payment.receiptNumber}`,
        amount: payment.amount,
        category: 'Cobro de Préstamo',
        date: payment.date,
        processedBy: payment.receivedBy,
      };

      return {
        ...state,
        payments: updatedPayments,
        loans: updatedLoans,
        cashTransactions: [...state.cashTransactions, cashTransaction],
      };
    }

    case 'ADD_EXPENSE': {
      const expense = action.payload;

      // Registrar como transacción de caja (gasto)
      const expenseTransaction: CashTransaction = {
        id: `CT-AUTO-${Date.now()}`,
        type: 'expense',
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        processedBy: expense.registeredBy,
      };

      return {
        ...state,
        expenses: [...state.expenses, expense],
        cashTransactions: [...state.cashTransactions, expenseTransaction],
      };
    }

    case 'ADD_DEPOSIT': {
      const deposit = action.payload;

      // Registrar como transacción de caja (depósito)
      const depositTransaction: CashTransaction = {
        id: `CT-AUTO-${Date.now()}`,
        type: 'deposit',
        description: `Depósito a ${formatBankName(deposit.bank)} — Ref: ${deposit.referenceNumber}`,
        amount: deposit.amount,
        category: 'Depósito Bancario',
        date: deposit.date,
        processedBy: deposit.depositedBy,
      };

      return {
        ...state,
        bankDeposits: [...state.bankDeposits, deposit],
        cashTransactions: [...state.cashTransactions, depositTransaction],
      };
    }

    case 'SWITCH_ROLE':
      return {
        ...state,
        currentRole: action.payload.role,
        currentUser: action.payload.userName,
      };

    case 'LOG_RECEIPT': {
      const { routeId, clientId, receiptNumber: _receipt } = action.payload;

      const updatedRoutes = state.collectorRoutes.map((route) => {
        if (route.id !== routeId) return route;

        const updatedClients = route.clients.map((client) => {
          if (client.clientId !== clientId) return client;
          return {
            ...client,
            collected: true,
            receiptLogged: true,
          };
        });

        const totalCollected = updatedClients
          .filter((c) => c.collected)
          .reduce((sum, c) => sum + c.amountDue, 0);

        const totalPending = updatedClients
          .filter((c) => !c.collected)
          .reduce((sum, c) => sum + c.amountDue, 0);

        return {
          ...route,
          clients: updatedClients,
          totalCollected,
          totalPending,
        };
      });

      return {
        ...state,
        collectorRoutes: updatedRoutes,
      };
    }

    case 'RESET_DATA':
      return createInitialState();

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

// =============================================================================
// Utilidades del Reducer
// =============================================================================

function formatBankName(bank: string): string {
  const bankNames: Record<string, string> = {
    banreservas: 'Banreservas',
    banco_popular: 'Banco Popular',
    bhd: 'BHD León',
  };
  return bankNames[bank] || bank;
}

// =============================================================================
// Contexto de React
// =============================================================================

interface LoanSystemContextType {
  state: LoanSystemState;
  dispatch: React.Dispatch<LoanSystemAction>;

  // Acciones de conveniencia
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  addLoan: (loan: Loan) => void;
  makePayment: (payment: Payment) => void;
  addExpense: (expense: Expense) => void;
  addDeposit: (deposit: BankDeposit) => void;
  switchRole: (role: UserRole, userName: string) => void;
  logReceipt: (routeId: string, clientId: string, receiptNumber: string) => void;
  resetData: () => void;
}

const LoanSystemContext = createContext<LoanSystemContextType | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface LoanSystemProviderProps {
  children: ReactNode;
}

export function LoanSystemProvider({ children }: LoanSystemProviderProps) {
  const [state, dispatch] = useReducer(loanSystemReducer, null, () => {
    return createInitialState();
  });

  const isLoaded = useRef(false);

  // Cargar del localStorage después de montar en el cliente para evitar mismatch de hidratación
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LoanSystemState;
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch {
      console.warn('CréditoÁgil RD: Error cargando datos guardados, usando datos semilla.');
    }
    isLoaded.current = true;
  }, []);

  // Persistir en localStorage cada vez que cambia el estado (solo si ya se cargó)
  useEffect(() => {
    if (!isLoaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      console.warn('CréditoÁgil RD: Error guardando datos en localStorage.');
    }
  }, [state]);

  // Acciones de conveniencia
  const addClient = (client: Client) => dispatch({ type: 'ADD_CLIENT', payload: client });
  const updateClient = (client: Client) => dispatch({ type: 'UPDATE_CLIENT', payload: client });
  const addLoan = (loan: Loan) => dispatch({ type: 'ADD_LOAN', payload: loan });
  const makePayment = (payment: Payment) => dispatch({ type: 'MAKE_PAYMENT', payload: payment });
  const addExpense = (expense: Expense) => dispatch({ type: 'ADD_EXPENSE', payload: expense });
  const addDeposit = (deposit: BankDeposit) => dispatch({ type: 'ADD_DEPOSIT', payload: deposit });
  const switchRole = (role: UserRole, userName: string) =>
    dispatch({ type: 'SWITCH_ROLE', payload: { role, userName } });
  const logReceipt = (routeId: string, clientId: string, receiptNumber: string) =>
    dispatch({ type: 'LOG_RECEIPT', payload: { routeId, clientId, receiptNumber } });
  const resetData = () => dispatch({ type: 'RESET_DATA' });

  const contextValue: LoanSystemContextType = {
    state,
    dispatch,
    addClient,
    updateClient,
    addLoan,
    makePayment,
    addExpense,
    addDeposit,
    switchRole,
    logReceipt,
    resetData,
  };

  return (
    <LoanSystemContext.Provider value={contextValue}>
      {children}
    </LoanSystemContext.Provider>
  );
}

// =============================================================================
// Custom Hook
// =============================================================================

/**
 * Hook para acceder al contexto del sistema de préstamos.
 * Debe usarse dentro de un <LoanSystemProvider>.
 *
 * @returns Objeto con el estado y funciones de despacho
 * @throws Error si se usa fuera del provider
 *
 * @example
 * const { state, addClient, makePayment } = useLoanSystem();
 */
export function useLoanSystem(): LoanSystemContextType {
  const context = useContext(LoanSystemContext);

  if (!context) {
    throw new Error(
      'useLoanSystem debe usarse dentro de un <LoanSystemProvider>. ' +
      'Asegúrese de envolver su aplicación con el provider.',
    );
  }

  return context;
}
