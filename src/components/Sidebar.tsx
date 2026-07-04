import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Calendar, 
  FolderLock, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ViewType = 'dashboard' | 'contatti' | 'chiamate' | 'agenda' | 'documenti';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  user: { email: string; isDemo: boolean };
  onLogout: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  user,
  onLogout,
  isOpenMobile,
  setIsOpenMobile,
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contatti' as ViewType, label: 'Contatti', icon: Users },
    { id: 'chiamate' as ViewType, label: 'Chiamate', icon: PhoneCall },
    { id: 'agenda' as ViewType, label: 'Agenda', icon: Calendar },
    { id: 'documenti' as ViewType, label: 'Documenti Drive', icon: FolderLock },
  ];

  const handleNavClick = (viewId: ViewType) => {
    onViewChange(viewId);
    setIsOpenMobile(false);
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 text-zinc-900" id="sidebar-inner">
      {/* Brand Logo */}
      <div className="p-6 border-b border-zinc-100 flex items-center gap-3" id="sidebar-brand">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
          <span className="font-sans text-sm font-bold">Na</span>
        </div>
        <div>
          <div>
            <h2 className="font-sans font-bold tracking-tight text-lg text-zinc-800">Livoom Gestione Clienti</h2>
            <p className="text-[10px] text-zinc-400 font-semibold">Created by Na Creator Italia</p>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {user.isDemo ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-semibold">
                <Sparkles className="w-2.5 h-2.5" /> Demo Sandbox
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                <Database className="w-2.5 h-2.5" /> Supabase Cloud
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1" id="sidebar-navigation">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-3">Menù Principale</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors group cursor-pointer ${
                isActive 
                  ? 'bg-zinc-100 text-indigo-600' 
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/80'
              }`}
              id={`sidebar-link-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-600'
                }`} />
                <span>{item.label}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-0 transition-all ${
                isActive ? 'opacity-100 text-indigo-600 translate-x-0.5' : 'group-hover:opacity-40 group-hover:translate-x-0.5'
              }`} />
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout Panel */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50" id="sidebar-user-footer">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-zinc-200/60" id="user-badge">
          <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center font-semibold text-xs text-zinc-700 font-mono">
            {user.email ? user.email.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-800 truncate">{user.email || 'Utente'}</p>
            <p className="text-[10px] text-zinc-500 truncate">Operatore CRM</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-3 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
          id="sidebar-logout-btn"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnetti Sessione</span>
        </button>
      </div>
    </div>
  );;

  return (
    <>
      {/* Desktop Sidebar (Permanent left sidebar for screen sizes >= lg) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-20 h-screen" id="desktop-sidebar">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Navigation (using Framer Motion) */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden fixed inset-0 bg-slate-950 z-30"
              id="mobile-sidebar-backdrop"
            />
            {/* Slide-out Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-40 shadow-2xl h-screen"
              id="mobile-sidebar"
            >
              {/* Close Button on mobile */}
              <button
                onClick={() => setIsOpenMobile(false)}
                className="absolute top-4 right-[-44px] p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                id="mobile-sidebar-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
              {renderNavContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
