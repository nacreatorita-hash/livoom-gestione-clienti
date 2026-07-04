import React from 'react';
import { Contact, Call, Appointment, DocumentDrive, CRMStats } from '../types';
import { 
  Users, 
  PhoneCall, 
  Calendar, 
  FileCheck, 
  PhoneOutgoing, 
  CalendarCheck, 
  History, 
  ChevronRight, 
  UserCheck, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  SearchCheck,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  contacts: Contact[];
  calls: Call[];
  appointments: Appointment[];
  documents: DocumentDrive[];
  onNavigateToView: (view: 'dashboard' | 'contatti' | 'chiamate' | 'agenda' | 'documenti') => void;
  onSelectContact: (contactId: string) => void;
  onAddCallForContact: (contact: Contact) => void;
}

export default function DashboardView({
  contacts,
  calls,
  appointments,
  documents,
  onNavigateToView,
  onSelectContact,
  onAddCallForContact,
}: DashboardViewProps) {
  
  // Get today's date formatted as YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fixed today string fallback matching metadata date (2026-07-03)
  const todayStr = getTodayString() === '2026-07-03' ? '2026-07-03' : getTodayString();

  // Helper helper to get contact name from ID
  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.nome} ${contact.cognome}` : 'Contatto Sconosciuto';
  };

  const getContactObj = (contactId: string) => {
    return contacts.find(c => c.id === contactId);
  };

  // 1. Calculate stats
  const totalContacts = contacts.length;
  const newContacts = contacts.filter(c => c.stato === 'Nuovo').length;
  const wonContacts = contacts.filter(c => c.stato === 'Chiuso Vinto').length;
  
  const totalCalls = calls.length;
  const totalAppts = appointments.length;
  const totalDocs = documents.length;

  // 2. Identify contacts to recall today
  // A contact needs a recall today if their LATEST call has prossimo_richiamo === todayStr
  // OR if they have ANY call with prossimo_richiamo === todayStr (simplified)
  const recallsToday = contacts.filter(contact => {
    // find all calls for this contact
    const contactCalls = calls.filter(c => c.contatto_id === contact.id);
    if (contactCalls.length === 0) return false;
    
    // Sort calls to find the latest
    const sorted = [...contactCalls].sort((a, b) => new Date(b.data_chiamata).getTime() - new Date(a.data_chiamata).getTime());
    return sorted[0]?.prossimo_richiamo === todayStr;
  });

  // 3. Appointments scheduled for today
  const todayAppointments = appointments.filter(appt => appt.data === todayStr);

  // 4. Last 4 calls made
  const recentCalls = calls.slice(0, 4);

  // 5. Contact Source counts for Dashboard
  const fbCount = contacts.filter(c => c.source_type === 'Facebook' || c.source_type === 'Gruppo Facebook').length;
  const igCount = contacts.filter(c => c.source_type === 'Instagram').length;
  const mpCount = contacts.filter(c => c.source_type === 'Marketplace').length;
  const othersCount = contacts.filter(c => c.source_type && !['Facebook', 'Gruppo Facebook', 'Instagram', 'Marketplace'].includes(c.source_type)).length;

  // Stats cards definitions
  const statCards = [
    {
      title: 'Contatti Totali',
      value: totalContacts,
      subtitle: `${newContacts} Nuovi leads`,
      icon: Users,
      color: 'bg-white border-zinc-200 text-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600',
      view: 'contatti' as const,
    },
    {
      title: 'Chiamate Loggate',
      value: totalCalls,
      subtitle: 'Attività registrate',
      icon: PhoneCall,
      color: 'bg-white border-zinc-200 text-amber-600',
      iconBg: 'bg-amber-50 text-amber-600',
      view: 'chiamate' as const,
    },
    {
      title: 'Agenda Appuntamenti',
      value: totalAppts,
      subtitle: `${todayAppointments.length} oggi`,
      icon: Calendar,
      color: 'bg-white border-zinc-200 text-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
      view: 'agenda' as const,
    },
    {
      title: 'Documenti Drive',
      value: totalDocs,
      subtitle: 'Contratti e bozze',
      icon: FileCheck,
      color: 'bg-white border-zinc-200 text-purple-600',
      iconBg: 'bg-purple-50 text-purple-600',
      view: 'documenti' as const,
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8" id="dashboard-view-root">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-zinc-200 rounded-3xl p-6 relative overflow-hidden shadow-sm" id="dashboard-welcome">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full filter blur-3xl pointer-events-none" />
        <div className="z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase px-2 py-0.5 rounded bg-indigo-50">PANORAMICA</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" /> {new Date(todayStr).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-800 tracking-tight">Benvenuto in Livoom Gestione Clienti</h2>
          <p className="text-zinc-500 text-xs max-w-xl font-medium">
            Ecco lo stato delle tue vendite e delle relazioni con i clienti per oggi. Gestisci le trattative con precisione.
          </p>
        </div>
        <div className="z-10 shrink-0 flex gap-2">
          <button 
            onClick={() => onNavigateToView('contatti')} 
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl text-xs transition-colors shadow-sm shadow-indigo-150 cursor-pointer flex items-center gap-1.5"
          >
            Nuovo Contatto
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Rapid Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onNavigateToView(card.view)}
              className={`p-5 rounded-2xl border bg-white hover:bg-zinc-50/50 transition-all cursor-pointer flex items-start justify-between group shadow-sm border-zinc-200/80`}
              id={`stat-card-${i}`}
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">{card.title}</span>
                <span className="text-3xl font-bold tracking-tight text-zinc-800 block">{card.value}</span>
                <span className="text-xs text-zinc-500 block font-medium">{card.subtitle}</span>
              </div>
              <div className={`p-2.5 rounded-xl border border-zinc-100 transition-transform ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Focus: Recalls & Calendar for Today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-focus-grid">
        
        {/* Recalls Column */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5" id="dashboard-recalls-section">
          <div className="flex items-center justify-between" id="recalls-header">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <PhoneOutgoing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Da Richiamare Oggi</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Contatti con follow-up programmato per oggi</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/50">
              {recallsToday.length} Scadenze
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-1" id="recalls-list">
            {recallsToday.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50" id="recalls-empty">
                <SearchCheck className="w-8 h-8 text-zinc-400 mb-2" />
                <h4 className="text-xs font-bold text-zinc-600">Tutto in ordine!</h4>
                <p className="text-[10px] text-zinc-400 max-w-[240px] mt-1 font-medium">
                  Non ci sono richiami programmati per oggi. Ottimo lavoro con i tuoi lead!
                </p>
              </div>
            ) : (
              recallsToday.map(contact => (
                <div 
                  key={contact.id} 
                  className="p-4 rounded-2xl bg-white border border-zinc-100 hover:bg-zinc-50/50 hover:border-zinc-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 
                        onClick={() => onSelectContact(contact.id)}
                        className="text-xs font-bold text-zinc-800 hover:text-indigo-600 hover:underline cursor-pointer"
                      >
                        {contact.nome} {contact.cognome}
                      </h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        contact.tipo === 'Lead' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        contact.tipo === 'Cliente' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        contact.tipo === 'Prospect' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        'bg-zinc-50 text-zinc-600 border border-zinc-100'
                      }`}>
                        {contact.tipo}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span>{contact.telefono}</span>
                      <span className="text-zinc-300">&bull;</span>
                      <span className="truncate max-w-[150px] underline">{contact.email}</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 font-medium italic truncate max-w-md">
                      Nota contatto: {contact.note || 'Nessuna nota aggiuntiva'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onAddCallForContact(contact)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Registra Chiamata
                    </button>
                    <button
                      onClick={() => onSelectContact(contact.id)}
                      className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Appointments Column (Contrasting Dark Bento Card!) */}
        <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl flex flex-col gap-4" id="dashboard-appointments-section">
          <div className="flex items-center justify-between" id="appts-header">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Agenda Odierna</h3>
                <p className="text-[11px] text-zinc-500 font-semibold">{new Date(todayStr).toLocaleDateString('it-IT', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-1" id="appts-list">
            {todayAppointments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50" id="appts-empty">
                <Calendar className="w-8 h-8 text-zinc-700 mb-2" />
                <h4 className="text-xs font-bold text-zinc-500">Nessun impegno</h4>
                <p className="text-[10px] text-zinc-600 max-w-[200px] mt-1 font-medium">
                  Non hai appuntamenti programmati per oggi in agenda.
                </p>
              </div>
            ) : (
              todayAppointments.map(appt => {
                const contact = getContactObj(appt.contatto_id);
                return (
                  <div 
                    key={appt.id} 
                    className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 hover:bg-zinc-850 transition-all space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-900 px-2 py-0.5 rounded bg-indigo-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 stroke-[3px]" />
                        {appt.ora}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-700 border border-zinc-600 text-zinc-300 font-bold uppercase">
                        {appt.tipo}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{appt.titolo}</h4>
                      {contact && (
                        <p 
                          onClick={() => onSelectContact(contact.id)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-bold"
                        >
                          Con: {contact.nome} {contact.cognome}
                        </p>
                      )}
                    </div>
                    {appt.note && (
                      <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-700/50 pt-1.5 italic line-clamp-2">
                        "{appt.note}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Recent Calls and Acquisition Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-bottom-grid">
        
        {/* Recent Calls (Contrasting Indigo Card!) - lg:col-span-2 */}
        <div className="lg:col-span-2 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col justify-between" id="dashboard-history">
          <div>
            <div className="flex items-center justify-between mb-4" id="history-header">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-950">Ultime Chiamate</h3>
                  <p className="text-[11px] text-indigo-600 font-semibold">Cronologia recente delle chiamate effettuate</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigateToView('chiamate')} 
                className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
              >
                Vedi tutte <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="history-grid">
              {recentCalls.length === 0 ? (
                <div className="col-span-full py-8 text-center border border-dashed border-indigo-200 bg-white/50 rounded-2xl" id="history-empty">
                  <PhoneCall className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                  <p className="text-xs text-indigo-400 font-semibold">Nessuna chiamata registrata finora.</p>
                </div>
              ) : (
                recentCalls.map(call => {
                  const contactName = getContactName(call.contatto_id);
                  return (
                    <div 
                      key={call.id} 
                      className="p-4 rounded-2xl bg-white border border-indigo-100 flex items-start gap-3 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        call.esito === 'Risposto' || call.esito === 'Appuntamento fissato'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : call.esito === 'Non risposto'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 
                            onClick={() => onSelectContact(call.contatto_id)}
                            className="text-xs font-bold text-indigo-950 truncate hover:text-indigo-600 hover:underline cursor-pointer"
                          >
                            {contactName}
                          </h4>
                          <span className="text-[9px] text-zinc-400 font-bold">
                            {new Date(call.data_chiamata).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            call.esito === 'Risposto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            call.esito === 'Appuntamento fissato' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            call.esito === 'Non risposto' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            call.esito === 'Non interessato' ? 'bg-zinc-50 text-zinc-500 border border-zinc-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {call.esito}
                          </span>
                          {call.prossimo_richiamo && (
                            <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-1 font-bold">
                              <Clock className="w-2.5 h-2.5 text-amber-500" />
                              Richiamare: {new Date(call.prossimo_richiamo).toLocaleDateString('it-IT')}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium italic line-clamp-2 mt-1">
                          "{call.nota || 'Nessun dettaglio'}"
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Acquisition Channels (Origine Contatti) - lg:col-span-1 */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm" id="dashboard-sources-summary">
          <div>
            <div className="flex items-center gap-2 mb-4" id="sources-summary-header">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Canali di Acquisizione</h3>
                <p className="text-[11px] text-zinc-500 font-semibold font-sans">Canali che generano più contatti</p>
              </div>
            </div>

            <div className="space-y-4" id="sources-progress-bars">
              {/* Facebook */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    Facebook & Gruppi
                  </span>
                  <span className="font-mono font-bold text-zinc-500">{fbCount} ({totalContacts > 0 ? Math.round((fbCount / totalContacts) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${totalContacts > 0 ? (fbCount / totalContacts) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
                    Instagram
                  </span>
                  <span className="font-mono font-bold text-zinc-500">{igCount} ({totalContacts > 0 ? Math.round((igCount / totalContacts) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${totalContacts > 0 ? (igCount / totalContacts) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Marketplace */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    Marketplace
                  </span>
                  <span className="font-mono font-bold text-zinc-500">{mpCount} ({totalContacts > 0 ? Math.round((mpCount / totalContacts) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${totalContacts > 0 ? (mpCount / totalContacts) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Altri Canali */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 inline-block"></span>
                    Altri canali
                  </span>
                  <span className="font-mono font-bold text-zinc-500">{othersCount} ({totalContacts > 0 ? Math.round((othersCount / totalContacts) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div 
                    className="bg-zinc-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${totalContacts > 0 ? (othersCount / totalContacts) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 rounded-xl p-3 text-[10px] text-zinc-500 font-semibold text-center border border-zinc-150 mt-4" id="sources-summary-footer">
            Canale principale: <span className="text-indigo-600 font-bold">{
              fbCount >= igCount && fbCount >= mpCount && fbCount >= othersCount && fbCount > 0 ? 'Facebook' :
              igCount >= fbCount && igCount >= mpCount && igCount >= othersCount && igCount > 0 ? 'Instagram' :
              mpCount >= fbCount && mpCount >= igCount && mpCount >= othersCount && mpCount > 0 ? 'Marketplace' :
              othersCount > 0 ? 'Altri Canali' : 'Nessun dato'
            }</span>
          </div>
        </div>

      </div>
    </div>
  );
}
