'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { formatRD } from '@/lib/currency';
import { formatCedula } from '@/lib/cedula-validator';
import type { Payment, PaymentType } from '@/types';

export default function CashierWindow() {
  const { state, makePayment } = useLoanSystem();
  const { clients, loans, cashTransactions } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState('1');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('regular');

  // Filtrar clientes por búsqueda
  const filteredClients = searchQuery
    ? clients.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.cedula.includes(searchQuery),
      )
    : [];

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientLoans = loans.filter((l) => l.clientId === selectedClientId && l.status === 'active');
  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  // Obtener cuotas pendientes del préstamo seleccionado
  const pendingInstallments = selectedLoan
    ? selectedLoan.installments.filter((inst) => inst.status !== 'paid')
    : [];

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setSearchQuery('');
    // Auto-seleccionar primer préstamo activo
    const activeLoans = loans.filter((l) => l.clientId === clientId && l.status === 'active');
    if (activeLoans.length > 0) {
      setSelectedLoanId(activeLoans[0].id);
      const firstPending = activeLoans[0].installments.find((inst) => inst.status !== 'paid');
      if (firstPending) {
        setSelectedInstallmentNumber(firstPending.number.toString());
        setAmount(firstPending.totalPayment.toString());
      }
    } else {
      setSelectedLoanId('');
      setSelectedInstallmentNumber('1');
      setAmount('');
    }
  };

  const handleLoanChange = (loanId: string) => {
    setSelectedLoanId(loanId);
    const loan = loans.find((l) => l.id === loanId);
    if (loan) {
      const firstPending = loan.installments.find((inst) => inst.status !== 'paid');
      if (firstPending) {
        setSelectedInstallmentNumber(firstPending.number.toString());
        setAmount(firstPending.totalPayment.toString());
      }
    }
  };

  const handleInstallmentChange = (instNum: string) => {
    setSelectedInstallmentNumber(instNum);
    const num = parseInt(instNum);
    const inst = selectedLoan?.installments.find((i) => i.number === num);
    if (inst) {
      setAmount((inst.totalPayment - inst.paidAmount).toString());
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId || !selectedLoanId || !selectedInstallmentNumber || !amount) {
      alert('Por favor complete todos los datos del pago.');
      return;
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      alert('Ingrese un monto válido.');
      return;
    }

    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: Payment = {
      id: `PAY-${Date.now()}`,
      loanId: selectedLoanId,
      clientId: selectedClientId,
      installmentNumber: parseInt(selectedInstallmentNumber),
      amount: payAmount,
      paymentType,
      receiptNumber: receiptNum,
      receivedBy: state.currentUser,
      date: new Date().toISOString(),
    };

    makePayment(newPayment);
    alert(`Pago registrado exitosamente.\nRecibo No: ${receiptNum}\nMonto: ${formatRD(payAmount)}`);

    // Resetear formulario de pago
    setAmount('');
    setSelectedClientId('');
    setSelectedLoanId('');
  };

  // Calcular métricas de caja diarias (del día de hoy en hora local)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = cashTransactions.filter((tx) => tx.date.startsWith(todayStr));

  const cashIn = todayTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const cashOut = todayTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const bankDeposited = todayTransactions
    .filter((tx) => tx.type === 'deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentCash = cashIn - cashOut - bankDeposited;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Columna Izquierda: Búsqueda y Caja */}
      <div className="lg:col-span-4 space-y-6">
        {/* Panel de Búsqueda */}
        <div className="glass-card-solid p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
            Buscar Cliente
          </h3>

          <div className="relative">
            <input
              type="text"
              placeholder="Nombre o Cédula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass"
            />
            {filteredClients.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-20">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c.id)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 text-slate-700 hover:text-blue-600 border-b border-slate-200/30 flex items-center justify-between cursor-pointer"
                  >
                    <span>
                      {c.firstName} {c.lastName}
                    </span>
                    <span className="font-mono text-slate-450">{formatCedula(c.cedula)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedClient && (
            <div className="mt-4 p-3 bg-slate-50/80 rounded-lg border border-slate-100/80 space-y-2">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Cliente Seleccionado</h4>
              <p className="text-sm font-bold text-slate-700">
                {selectedClient.firstName} {selectedClient.lastName}
              </p>
              <p className="text-xs text-slate-500 font-mono">Cédula: {formatCedula(selectedClient.cedula)}</p>
              <p className="text-xs text-slate-500">Tel: {selectedClient.phone}</p>
              <p className="text-xs text-slate-500">Ciudad: {selectedClient.city}</p>
            </div>
          )}
        </div>

        {/* Balance de Caja Operativa Diaria */}
        <div className="glass-card-solid p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
            Balance de Caja Diario
          </h3>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Cobros del Día (+):</span>
              <span className="font-bold text-emerald-600 font-mono">{formatRD(cashIn)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Gastos Registrados (-):</span>
              <span className="font-bold text-rose-600 font-mono">{formatRD(cashOut)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Depósitos Bancarios (-):</span>
              <span className="font-bold text-indigo-600 font-mono">{formatRD(bankDeposited)}</span>
            </div>
            <div className="border-t border-slate-200/40 pt-3 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Efectivo en Caja:</span>
              <span className="text-base font-extrabold font-mono text-blue-600">{formatRD(currentCash)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Registrar Pago */}
      <div className="lg:col-span-8 glass-card-solid p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 font-[var(--font-heading)]">
          Recepción de Pago
        </h3>

        {!selectedClientId ? (
          <div className="h-64 flex items-center justify-center text-slate-400 italic text-sm">
            Busque y seleccione un cliente en el panel izquierdo para procesar pagos.
          </div>
        ) : clientLoans.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 italic text-sm text-center">
            El cliente seleccionado no tiene préstamos activos actualmente.
          </div>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Préstamo Activo
                </label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => handleLoanChange(e.target.value)}
                  className="input-glass cursor-pointer"
                >
                  {clientLoans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.id} ({formatRD(l.amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cuota Pendiente
                </label>
                <select
                  value={selectedInstallmentNumber}
                  onChange={(e) => handleInstallmentChange(e.target.value)}
                  className="input-glass cursor-pointer"
                >
                  {pendingInstallments.map((inst) => (
                    <option key={inst.number} value={inst.number.toString()}>
                      Cuota #{inst.number} (Vence {new Date(inst.dueDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tipo de Pago
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className="input-glass cursor-pointer"
                >
                  <option value="regular">Cuota Regular</option>
                  <option value="capital">Abono a Capital</option>
                  <option value="full">Saldo Total</option>
                </select>
              </div>
            </div>

            {selectedLoan && selectedInstallmentNumber && (
              <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-100/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Capital Cuota</span>
                  <p className="text-xs font-bold text-slate-700 font-mono mt-1">
                    {formatRD(selectedLoan.installments.find((i) => i.number === parseInt(selectedInstallmentNumber))?.principal || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Interés Cuota</span>
                  <p className="text-xs font-bold text-slate-700 font-mono mt-1">
                    {formatRD(selectedLoan.installments.find((i) => i.number === parseInt(selectedInstallmentNumber))?.interest || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Mora Acumulada</span>
                  <p className="text-xs font-bold text-rose-600 font-mono mt-1">
                    {formatRD(selectedLoan.installments.find((i) => i.number === parseInt(selectedInstallmentNumber))?.lateFee || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Total Cuota</span>
                  <p className="text-xs font-extrabold text-blue-600 font-mono mt-1">
                    {formatRD(selectedLoan.installments.find((i) => i.number === parseInt(selectedInstallmentNumber))?.totalPayment || 0)}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Monto Recibido (RD$) <span className="text-blue-600">*</span>
              </label>
              <input
                type="number"
                required
                min="100"
                step="50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full md:w-1/2 input-glass text-lg font-bold font-mono text-blue-600"
                placeholder="Monto a pagar"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200/40 pt-6">
              <button
                type="button"
                onClick={() => setSelectedClientId('')}
                className="btn-secondary"
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Registrar Pago de Cuota
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
