'use client';

import { useState } from 'react';
import { useLoanSystem } from '@/context/LoanSystemContext';
import type { UserRole } from '@/types';
import { 
  SettingsIcon, 
  ClientsIcon, 
  CashierIcon, 
  CollectorIcon,
  CheckIcon
} from '@/components/ui/Icons';

interface RoleOption {
  role: UserRole;
  label: string;
  renderIcon: (className?: string) => React.ReactNode;
}

const roleOptions: RoleOption[] = [
  { role: 'Admin', label: 'Admin', renderIcon: (cls) => <SettingsIcon className={cls} size={16} /> },
  { role: 'Credit_Officer', label: 'Oficial de Crédito', renderIcon: (cls) => <ClientsIcon className={cls} size={16} /> },
  { role: 'Cashier', label: 'Cajero/a', renderIcon: (cls) => <CashierIcon className={cls} size={16} /> },
  { role: 'Collector', label: 'Cobrador', renderIcon: (cls) => <CollectorIcon className={cls} size={16} /> },
];

export default function RoleSwitcher() {
  const { state, switchRole } = useLoanSystem();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      Admin: 'Carlos Méndez',
      Credit_Officer: 'José Rodríguez',
      Cashier: 'María Santos',
      Collector: 'Ramón Alberto',
    };
    switchRole(role, roleNames[role]);
  };

  return (
    <div className="role-switcher fixed bottom-6 right-6 z-50">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="glass-card-solid p-4 mb-3 animate-fade-in-scale min-w-[220px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Cambiar Rol
          </p>
          <div className="space-y-1.5">
            {roleOptions.map((option) => (
              <button
                key={option.role}
                onClick={() => handleRoleChange(option.role)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${state.currentRole === option.role
                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/10 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {option.renderIcon(state.currentRole === option.role ? 'text-blue-600' : 'text-slate-400')}
                <span>{option.label}</span>
                {state.currentRole === option.role && (
                  <CheckIcon size={14} className="ml-auto text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider
          transition-all duration-300 shadow-md
          ${isExpanded
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10'
            : 'glass-card-solid text-slate-700 hover:text-blue-600 hover:scale-[1.02]'
          }
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
        >
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
        <span>{isExpanded ? 'Cerrar' : 'Cambiar Rol'}</span>
      </button>
    </div>
  );
}
