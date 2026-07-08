'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLoanSystem } from '@/context/LoanSystemContext';
import type { UserRole } from '@/types';
import { 
  DashboardIcon, 
  ClientsIcon, 
  LoansIcon, 
  SimulatorIcon, 
  CashierIcon, 
  CollectorIcon, 
  ReportsIcon, 
  SettingsIcon,
  SparklesIcon
} from '@/components/ui/Icons';

interface NavItem {
  label: string;
  href: string;
  iconKey: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', iconKey: 'dashboard', roles: ['Admin', 'Credit_Officer', 'Cashier', 'Collector'] },
  { label: 'Clientes', href: '/clients', iconKey: 'clients', roles: ['Admin', 'Credit_Officer'] },
  { label: 'Préstamos', href: '/loans', iconKey: 'loans', roles: ['Admin', 'Credit_Officer'] },
  { label: 'Simulador', href: '/loans/simulator', iconKey: 'simulator', roles: ['Admin', 'Credit_Officer'] },
  { label: 'Caja', href: '/cashier', iconKey: 'cashier', roles: ['Admin', 'Cashier'] },
  { label: 'Rutas de Cobro', href: '/collector', iconKey: 'collector', roles: ['Admin', 'Collector'] },
  { label: 'Reportes', href: '/reports', iconKey: 'reports', roles: ['Admin', 'Credit_Officer'] },
  { label: 'Configuración', href: '/config', iconKey: 'settings', roles: ['Admin'] },
];

const roleLabels: Record<UserRole, string> = {
  Admin: 'Administrador',
  Credit_Officer: 'Oficial de Crédito',
  Cashier: 'Cajero/a',
  Collector: 'Cobrador',
};

const roleBadgeColors: Record<UserRole, string> = {
  Admin: 'bg-violet-50 text-violet-700 border border-violet-100',
  Credit_Officer: 'bg-blue-50 text-blue-700 border border-blue-100',
  Cashier: 'bg-amber-50 text-amber-700 border border-amber-100',
  Collector: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
};

const renderIcon = (key: string, className = '') => {
  switch (key) {
    case 'dashboard': return <DashboardIcon size={18} className={className} />;
    case 'clients': return <ClientsIcon size={18} className={className} />;
    case 'loans': return <LoansIcon size={18} className={className} />;
    case 'simulator': return <SimulatorIcon size={18} className={className} />;
    case 'cashier': return <CashierIcon size={18} className={className} />;
    case 'collector': return <CollectorIcon size={18} className={className} />;
    case 'reports': return <ReportsIcon size={18} className={className} />;
    case 'settings': return <SettingsIcon size={18} className={className} />;
    default: return null;
  }
};

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { state } = useLoanSystem();
  const pathname = usePathname();
  const { currentRole, currentUser } = state;

  const filteredNav = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className={`sidebar fixed left-4 top-4 bottom-4 w-64 bg-white/80 backdrop-blur-md border border-slate-200/80 flex flex-col z-45 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-[280px]'
    }`}>
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-300">
            <SparklesIcon size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 font-[var(--font-heading)] tracking-tight group-hover:text-blue-600 transition-colors duration-200">
              CréditoÁgil
            </h1>
            <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">RD</span>
          </div>
        </Link>

        {/* Botón Cerrar en Móvil */}
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-300 group relative border-l-2
                ${isActive
                  ? 'bg-blue-50/80 text-blue-600 border-blue-600 shadow-sm'
                  : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50 hover:translate-x-1'
                }
              `}
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {renderIcon(item.iconKey, isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info Card */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-black text-blue-600 shadow-sm shadow-blue-500/5">
              {currentUser.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{currentUser}</p>
              <span className={`inline-block mt-0.5 px-2 py-0.5 text-[9px] font-semibold rounded-full border ${roleBadgeColors[currentRole]}`}>
                {roleLabels[currentRole]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
