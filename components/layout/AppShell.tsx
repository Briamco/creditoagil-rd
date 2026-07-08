'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import RoleSwitcher from './RoleSwitcher';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Backdrop de fondo en móvil */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Barra superior flotante para Móviles */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 z-30 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-8 h-8 rounded-lg glass-card-static border border-slate-200/30 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
            title="Abrir Menú"
          >
            <span className="w-4 h-0.5 bg-slate-600 rounded-full" />
            <span className="w-4 h-0.5 bg-slate-600 rounded-full" />
            <span className="w-4 h-0.5 bg-slate-600 rounded-full" />
          </button>
          <span className="text-sm font-bold text-slate-800 font-[var(--font-heading)]">
            CréditoÁgil <span className="text-[9px] text-blue-600 font-extrabold tracking-wider">RD</span>
          </span>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 pl-6 lg:pl-72 pr-6 py-6 pt-20 lg:pt-6 min-h-screen w-full overflow-hidden">
        {children}
      </main>

      <RoleSwitcher />
    </div>
  );
}
