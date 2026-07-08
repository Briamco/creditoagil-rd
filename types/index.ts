// =============================================================================
// CréditoÁgil RD — Tipos e Interfaces del Sistema
// =============================================================================

/** Roles de usuario disponibles en el sistema */
export type UserRole = 'Admin' | 'Credit_Officer' | 'Cashier' | 'Collector';

/** Estado de riesgo del cliente */
export type RiskStatus = 'al_dia' | 'atraso_1_15' | 'moroso';

/** Frecuencia de pago del préstamo */
export type PaymentFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

/** Tipo de amortización */
export type AmortizationType = 'french' | 'simple';

/** Estado del préstamo */
export type LoanStatus = 'active' | 'paid' | 'defaulted';

/** Estado de una cuota */
export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'partial';

/** Tipo de pago realizado */
export type PaymentType = 'regular' | 'capital' | 'full';

/** Tipo de transacción de caja */
export type CashTransactionType = 'income' | 'expense' | 'deposit';

/** Bancos disponibles para depósitos */
export type BankName = 'banreservas' | 'banco_popular' | 'bhd';

// =============================================================================
// Fiador (Co-signer)
// =============================================================================

export interface Fiador {
  /** Nombre completo del fiador */
  name: string;
  /** Cédula en formato 000-0000000-0 */
  cedula: string;
  /** Teléfono de contacto */
  phone: string;
  /** Relación con el cliente */
  relationship: string;
}

// =============================================================================
// Garantía (Collateral)
// =============================================================================

export interface Garantia {
  /** Tipo de garantía (ej: "Vehículo", "Electrodoméstico", "Inmueble") */
  type: string;
  /** Descripción de la garantía */
  description: string;
  /** Valor estimado en RD$ */
  estimatedValue: number;
}

// =============================================================================
// Cliente
// =============================================================================

export interface Client {
  /** Identificador único del cliente */
  id: string;
  /** Cédula dominicana en formato 000-0000000-0 */
  cedula: string;
  /** Nombre(s) */
  firstName: string;
  /** Apellido(s) */
  lastName: string;
  /** Teléfono de contacto */
  phone: string;
  /** Dirección de residencia */
  address: string;
  /** Ciudad */
  city: string;
  /** Estado de riesgo crediticio */
  riskStatus: RiskStatus;
  /** Lista de fiadores */
  coSigners: Fiador[];
  /** Lista de garantías */
  collateral: Garantia[];
  /** Fecha de creación del registro */
  createdAt: string;
}

// =============================================================================
// Cuota (Installment)
// =============================================================================

export interface Installment {
  /** Número de cuota */
  number: number;
  /** Fecha de vencimiento (ISO string) */
  dueDate: string;
  /** Capital de la cuota */
  principal: number;
  /** Interés de la cuota */
  interest: number;
  /** Mora aplicada */
  lateFee: number;
  /** Pago total de la cuota (capital + interés + mora) */
  totalPayment: number;
  /** Balance restante después de esta cuota */
  remainingBalance: number;
  /** Estado de la cuota */
  status: InstallmentStatus;
  /** Monto pagado */
  paidAmount: number;
  /** Fecha de pago (ISO string, null si no se ha pagado) */
  paidDate: string | null;
}

// =============================================================================
// Préstamo (Loan)
// =============================================================================

export interface Loan {
  /** Identificador único del préstamo */
  id: string;
  /** ID del cliente asociado */
  clientId: string;
  /** Monto del préstamo en RD$ */
  amount: number;
  /** Tasa de interés (mensual, como decimal — ej: 0.03 = 3%) */
  interestRate: number;
  /** Plazo en períodos */
  term: number;
  /** Frecuencia de pago */
  frequency: PaymentFrequency;
  /** Tipo de amortización */
  amortizationType: AmortizationType;
  /** Estado del préstamo */
  status: LoanStatus;
  /** Tabla de amortización */
  installments: Installment[];
  /** Fecha de desembolso (ISO string) */
  disbursementDate: string;
  /** Usuario que creó el préstamo */
  createdBy: string;
}

// =============================================================================
// Pago (Payment)
// =============================================================================

export interface Payment {
  /** Identificador único del pago */
  id: string;
  /** ID del préstamo asociado */
  loanId: string;
  /** ID del cliente */
  clientId: string;
  /** Número de cuota a la que aplica */
  installmentNumber: number;
  /** Monto pagado en RD$ */
  amount: number;
  /** Tipo de pago */
  paymentType: PaymentType;
  /** Número de recibo */
  receiptNumber: string;
  /** Usuario que recibió el pago */
  receivedBy: string;
  /** Fecha del pago (ISO string) */
  date: string;
}

// =============================================================================
// Transacción de Caja (Cash Transaction)
// =============================================================================

export interface CashTransaction {
  /** Identificador único de la transacción */
  id: string;
  /** Tipo de transacción */
  type: CashTransactionType;
  /** Descripción de la transacción */
  description: string;
  /** Monto en RD$ */
  amount: number;
  /** Categoría de la transacción */
  category: string;
  /** Fecha de la transacción (ISO string) */
  date: string;
  /** Usuario que procesó la transacción */
  processedBy: string;
}

// =============================================================================
// Gasto (Expense)
// =============================================================================

export interface Expense {
  /** Identificador único del gasto */
  id: string;
  /** Descripción del gasto */
  description: string;
  /** Monto en RD$ */
  amount: number;
  /** Categoría del gasto */
  category: string;
  /** Fecha del gasto (ISO string) */
  date: string;
  /** Usuario que registró el gasto */
  registeredBy: string;
}

// =============================================================================
// Depósito Bancario (Bank Deposit)
// =============================================================================

export interface BankDeposit {
  /** Identificador único del depósito */
  id: string;
  /** Banco destino */
  bank: BankName;
  /** Monto depositado en RD$ */
  amount: number;
  /** Número de referencia */
  referenceNumber: string;
  /** Fecha del depósito (ISO string) */
  date: string;
  /** Usuario que realizó el depósito */
  depositedBy: string;
}

// =============================================================================
// Ruta de Cobro — Cliente en ruta
// =============================================================================

export interface RouteClient {
  /** ID del cliente */
  clientId: string;
  /** Nombre completo del cliente */
  clientName: string;
  /** Cédula del cliente */
  cedula: string;
  /** Dirección de cobro */
  address: string;
  /** Monto adeudado en RD$ */
  amountDue: number;
  /** Días de atraso */
  daysOverdue: number;
  /** Si se cobró en esta visita */
  collected: boolean;
  /** Si se registró el recibo */
  receiptLogged: boolean;
}

// =============================================================================
// Ruta de Cobro (Collector Route)
// =============================================================================

export interface CollectorRoute {
  /** Identificador único de la ruta */
  id: string;
  /** Nombre del cobrador */
  collectorName: string;
  /** Nombre de la zona */
  zoneName: string;
  /** Fecha de la ruta (ISO string) */
  date: string;
  /** Clientes asignados a la ruta */
  clients: RouteClient[];
  /** Total cobrado en RD$ */
  totalCollected: number;
  /** Total pendiente en RD$ */
  totalPending: number;
}

// =============================================================================
// Estado Global del Sistema
// =============================================================================

export interface LoanSystemState {
  /** Lista de clientes */
  clients: Client[];
  /** Lista de préstamos */
  loans: Loan[];
  /** Lista de pagos */
  payments: Payment[];
  /** Transacciones de caja */
  cashTransactions: CashTransaction[];
  /** Gastos */
  expenses: Expense[];
  /** Depósitos bancarios */
  bankDeposits: BankDeposit[];
  /** Rutas de cobro */
  collectorRoutes: CollectorRoute[];
  /** Rol actual del usuario */
  currentRole: UserRole;
  /** Nombre del usuario actual */
  currentUser: string;
}
