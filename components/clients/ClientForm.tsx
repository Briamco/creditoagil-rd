'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import { isValidCedula, formatCedula } from '@/lib/cedula-validator';
import Dialog, { DialogHeader, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import type { Client, Fiador, Garantia } from '@/types';

interface ClientFormProps {
  onClose: () => void;
}

const CITIES = [
  'Santo Domingo',
  'Santiago de los Caballeros',
  'La Vega',
  'Puerto Plata',
  'San Cristóbal',
  'San Francisco de Macorís',
  'La Romana',
  'Higüey',
  'San Pedro de Macorís',
  'Moca',
  'Bonao',
  'Baní',
  'Barahona',
  'Barahona', // duplicate handled or safe
];

export default function ClientForm({ onClose }: ClientFormProps) {
  const { addClient } = useLoanSystem();

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(CITIES[0]);

  // Validation states
  const [cedulaError, setCedulaError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Sub-items states
  const [fiadores, setFiadores] = useState<Fiador[]>([]);
  const [garantias, setGarantias] = useState<Garantia[]>([]);

  // Temp item builders
  const [tempFiadorName, setTempFiadorName] = useState('');
  const [tempFiadorCedula, setTempFiadorCedula] = useState('');
  const [tempFiadorPhone, setTempFiadorPhone] = useState('');
  const [tempFiadorRelationship, setTempFiadorRelationship] = useState('');

  const [tempGarantiaType, setTempGarantiaType] = useState('Vehículo');
  const [tempGarantiaDesc, setTempGarantiaDesc] = useState('');
  const [tempGarantiaValue, setTempGarantiaValue] = useState('');

  // Handle Cédula formatting and validation
  const handleCedulaChange = (val: string) => {
    // Filtrar dígitos
    const digits = val.replace(/\D/g, '').slice(0, 11);
    const formatted = formatCedula(digits);
    setCedula(formatted);

    if (digits.length === 11) {
      if (!isValidCedula(formatted)) {
        setCedulaError('Cédula inválida (dígito verificador incorrecto)');
      } else {
        setCedulaError('');
      }
    } else {
      setCedulaError('Cédula debe tener 11 dígitos');
    }
  };

  const handleAddFiador = () => {
    if (!tempFiadorName || !tempFiadorCedula || !tempFiadorPhone || !tempFiadorRelationship) {
      alert('Por favor complete todos los datos del fiador.');
      return;
    }
    const cleanCedula = formatCedula(tempFiadorCedula.replace(/\D/g, ''));
    if (tempFiadorCedula.replace(/\D/g, '').length === 11 && !isValidCedula(cleanCedula)) {
      alert('La cédula del fiador no es válida.');
      return;
    }

    const newFiador: Fiador = {
      name: tempFiadorName,
      cedula: cleanCedula,
      phone: tempFiadorPhone,
      relationship: tempFiadorRelationship,
    };

    setFiadores([...fiadores, newFiador]);
    setTempFiadorName('');
    setTempFiadorCedula('');
    setTempFiadorPhone('');
    setTempFiadorRelationship('');
  };

  const handleRemoveFiador = (idx: number) => {
    setFiadores(fiadores.filter((_, i) => i !== idx));
  };

  const handleAddGarantia = () => {
    if (!tempGarantiaDesc || !tempGarantiaValue) {
      alert('Por favor ingrese una descripción y valor estimado para la garantía.');
      return;
    }

    const val = parseFloat(tempGarantiaValue);
    if (isNaN(val) || val <= 0) {
      alert('Ingrese un valor de garantía válido.');
      return;
    }

    const newGarantia: Garantia = {
      type: tempGarantiaType,
      description: tempGarantiaDesc,
      estimatedValue: val,
    };

    setGarantias([...garantias, newGarantia]);
    setTempGarantiaDesc('');
    setTempGarantiaValue('');
  };

  const handleRemoveGarantia = (idx: number) => {
    setGarantias(garantias.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !cedula || !phone || !address) {
      setGeneralError('Todos los campos principales del cliente son obligatorios.');
      return;
    }

    const cleanCedulaDigits = cedula.replace(/\D/g, '');
    if (cleanCedulaDigits.length !== 11) {
      setCedulaError('Cédula incompleta');
      return;
    }

    if (!isValidCedula(cedula)) {
      setCedulaError('Cédula no válida');
      return;
    }

    const newClient: Client = {
      id: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      cedula,
      firstName,
      lastName,
      phone,
      address,
      city,
      riskStatus: 'al_dia', // Comienza al día por defecto
      coSigners: fiadores,
      collateral: garantias,
      createdAt: new Date().toISOString(),
    };

    addClient(newClient);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} size="xl">
      <DialogHeader onClose={onClose}>Registrar Nuevo Cliente</DialogHeader>

      <DialogBody className="space-y-6">
        {generalError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
            {generalError}
          </div>
        )}

        <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Información Personal */}
          <div>
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
              1. Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Nombre(s) <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="Ej. Juan Carlos"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Apellido(s) <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="Ej. Pérez Marte"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cédula <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cedula}
                  onChange={(e) => handleCedulaChange(e.target.value)}
                  className={`w-full bg-slate-50 border rounded-lg p-2.5 text-sm font-mono text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all ${
                    cedulaError ? 'border-rose-500' : 'border-slate-200'
                  }`}
                  placeholder="001-0000000-0"
                />
                {cedulaError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{cedulaError}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Teléfono <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="Ej. 809-555-0123"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Dirección de Residencia <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="Ej. Calle 1ra #24, Los Tres Ojos"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ciudad <span className="text-blue-600">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Sección 2: Fiador */}
          <div>
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
              2. Fiador Solidario (Opcional)
            </h3>
            
            {/* List of Added Fiadores */}
            {fiadores.length > 0 && (
              <div className="mb-4 space-y-2">
                {fiadores.map((fia, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-150 text-sm">
                    <div>
                      <span className="font-bold text-slate-800">{fia.name}</span>{' '}
                      <span className="text-xs text-slate-450 font-mono">({fia.cedula})</span>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Tel: {fia.phone} | Relación: {fia.relationship}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFiador(i)}
                      className="text-rose-600 hover:text-rose-700 font-bold px-2 py-1 text-xs cursor-pointer transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-55 p-4 border border-slate-200/80 rounded-xl">
              <div>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={tempFiadorName}
                  onChange={(e) => setTempFiadorName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Cédula"
                  value={tempFiadorCedula}
                  onChange={(e) => setTempFiadorCedula(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={tempFiadorPhone}
                  onChange={(e) => setTempFiadorPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Relación (ej. Hermano)"
                  value={tempFiadorRelationship}
                  onChange={(e) => setTempFiadorRelationship(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddFiador}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 font-bold px-3 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Sección 3: Garantías */}
          <div>
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
              3. Garantías / Colateral (Opcional)
            </h3>

            {/* List of Added Garantias */}
            {garantias.length > 0 && (
              <div className="mb-4 space-y-2">
                {garantias.map((gar, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-55 border border-slate-150 text-sm">
                    <div>
                      <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold mr-2">
                        {gar.type}
                      </span>
                      <span className="text-slate-800 font-semibold">{gar.description}</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Valor estimado: <span className="font-bold text-amber-600">{new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(gar.estimatedValue)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGarantia(i)}
                      className="text-rose-600 hover:text-rose-700 font-bold px-2 py-1 text-xs cursor-pointer transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-55 p-4 border border-slate-200/80 rounded-xl">
              <div>
                <select
                  value={tempGarantiaType}
                  onChange={(e) => setTempGarantiaType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Vehículo">Vehículo</option>
                  <option value="Electrodoméstico">Electrodoméstico</option>
                  <option value="Inmueble">Inmueble</option>
                  <option value="Motocicleta">Motocicleta</option>
                  <option value="Joyas/Oro">Joyas/Oro</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Detalles de la garantía (ej: Marca, modelo, año, placa, etc.)"
                  value={tempGarantiaDesc}
                  onChange={(e) => setTempGarantiaDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Valor estimado (RD$)"
                  value={tempGarantiaValue}
                  onChange={(e) => setTempGarantiaValue(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddGarantia}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 font-bold px-3 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

        </form>
      </DialogBody>

      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg border border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="client-form"
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-md shadow-blue-500/10 cursor-pointer"
        >
          Crear Cliente
        </button>
      </DialogFooter>
    </Dialog>
  );
}
