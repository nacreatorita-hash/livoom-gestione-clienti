import React from 'react';
import { Menu, Sparkles, LogOut } from 'lucide-react';

interface HeaderProps {
  currentViewLabel: string;
  user: { email: string; isDemo: boolean };
  setIsOpenMobile: (open: boolean) => void;
  onLogout: () => void;
}

export default function Header({
  currentViewLabel,
  user,
  setIsOpenMobile,
  onLogout,
}: HeaderProps) {
  return (
    <header className="h-20 border-b border-zinc-200 bg-white sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between" id="app-header-container">
      {/* Left section */}
      <div className="flex items-center gap-3.5" id="header-left">
        {/* Burger menu on mobile */}
        <button
          onClick={() => setIsOpenMobile(true)}
          className="lg:hidden p-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
          id="mobile-hamburger"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
        <p className="header-eyebrow">Livoom Gestione Clienti</p>
        <h1 className="text-sm font-bold font-sans text-zinc-800 tracking-tight" id="header-view-label">
          {currentViewLabel}
        </h1>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3" id="header-right">
        
        {/* Connection status pills */}
        {user.isDemo && (
          <div className="hidden sm:block" id="connection-status-container">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              Demo Sandbox (Dati Locali)
            </div>
          </div>
        )}

        {/* Small avatar block */}
        <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

        <div className="flex items-center gap-2" id="header-profile">
          <div className="hidden md:flex flex-col text-right" id="header-profile-text">
            <span className="text-xs font-bold text-zinc-800 truncate max-w-[150px]">
              {user.email || 'Utente Demo'}
            </span>
            <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
              {user.email === 'access@admin.it' ? 'Amministratore' : 'Utente CRM'}
            </span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[11px] font-bold text-indigo-600 font-mono" id="header-avatar">
            {user.email ? user.email.slice(0, 2).toUpperCase() : 'US'}
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer"
            title="Sconnetti Sessione"
            id="header-logout-shortcut"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
