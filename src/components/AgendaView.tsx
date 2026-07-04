import React, { useState, useEffect } from 'react';
import { Contact, Appointment, AppointmentType } from '../types';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  X, 
  MapPin, 
  Video, 
  Phone, 
  MoreHorizontal,
  Trash2,
  AlertCircle,
  CalendarDays,
  User,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgendaViewProps {
  contacts: Contact[];
  appointments: Appointment[];
  onCreateAppointment: (appt: Omit<Appointment, 'id' | 'created_at' | 'user_id'>) => Promise<Appointment>;
  onDeleteAppointment: (id: string) => Promise<void>;
  onSelectContact: (contactId: string) => void;
  onNavigateToView: (view: 'dashboard' | 'contatti' | 'chiamate' | 'agenda' | 'documenti') => void;
  preselectedContact: Contact | null;
  clearPreselectedContact: () => void;
}

export default function AgendaView({
  contacts,
  appointments,
  onCreateAppointment,
  onDeleteAppointment,
  onSelectContact,
  onNavigateToView,
  preselectedContact,
  clearPreselectedContact,
}: AgendaViewProps) {
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Form Fields
  const [titolo, setTitolo] = useState('');
  const [contattoId, setContattoId] = useState('');
  const [data, setData] = useState('');
  const [ora, setOra] = useState('');
  const [tipo, setTipo] = useState<AppointmentType>('Video Call');
  const [note, setNote] = useState('');

  // Local date helper to mark today's meetings
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString() === '2026-07-03' ? '2026-07-03' : getTodayString();

  // Sync pre-selected contact
  useEffect(() => {
    if (preselectedContact) {
      setContattoId(preselectedContact.id);
      
      // Default to today and nearest hour
      setData(todayStr);
      setOra('10:00');
      setTipo('Video Call');
      setIsFormOpen(true);
    }
  }, [preselectedContact]);

  const handleOpenCreate = () => {
    setTitolo('');
    setContattoId(contacts[0]?.id || '');
    setData(todayStr);
    setOra('10:00');
    setTipo('Video Call');
    setNote('');
    setIsFormOpen(true);
  };

  const handleCloseCreate = () => {
    setIsFormOpen(false);
    clearPreselectedContact();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim() || !contattoId || !data || !ora) {
      alert('Tutti i campi contrassegnati con l\'asterisco (*) sono obbligatori.');
      return;
    }

    try {
      await onCreateAppointment({
        titolo: titolo.trim(),
        contatto_id: contattoId,
        data,
        ora,
        tipo,
        note: note.trim()
      });
      setIsFormOpen(false);
      clearPreselectedContact();
    } catch (err) {
      console.error('Error creating appointment', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo appuntamento dall\'agenda?')) {
      try {
        await onDeleteAppointment(id);
      } catch (err) {
        console.error('Error deleting appointment', err);
      }
    }
  };

  const getContactName = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    return contact ? `${contact.nome} ${contact.cognome}` : 'Contatto Sconosciuto';
  };

  const parseApptDate = (dateStr: string) => {
    if (!dateStr) return { day: '', month: '', weekday: '', year: '' };
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { day: '', month: '', weekday: '', year: '' };
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    
    // Formatters
    const dayName = date.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '').toUpperCase();
    const monthName = date.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '').toUpperCase();
    return {
      day: String(day).padStart(2, '0'),
      month: monthName,
      weekday: dayName,
      year: String(year)
    };
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(appt => {
    const contactName = getContactName(appt.contatto_id).toLowerCase();
    const matchSearch = appt.titolo.toLowerCase().includes(searchTerm.toLowerCase()) || contactName.includes(searchTerm.toLowerCase()) || appt.note.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'all' || appt.tipo === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="h-full flex flex-col gap-5" id="agenda-view-root">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="agenda-header">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            Agenda Appuntamenti
          </h2>
          <p className="text-xs text-zinc-400 font-semibold">Pianifica incontri di vendita, video call e scadenze contrattuali</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer"
          id="btn-add-appt"
        >
          <Plus className="w-4 h-4" />
          Pianifica Incontro
        </button>
      </div>

      {/* Filters Area */}
      <div className="p-4 bg-white border border-zinc-200 rounded-3xl flex flex-col md:flex-row gap-3 shadow-sm" id="agenda-filters">
        <div className="relative flex-1" id="appt-filter-search">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cerca per titolo, nota o nome contatto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-750 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold"
          id="appt-filter-type"
        >
          <option value="all">Tutti i Tipi</option>
          <option value="Telefonico">Telefonico</option>
          <option value="Video Call">Video Call</option>
          <option value="Presenziale">Presenziale</option>
          <option value="Altro">Altro</option>
        </select>
      </div>

      {/* Main Agenda Board */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm" id="agenda-board-container">
        {filteredAppointments.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center text-zinc-400" id="appointments-empty-state">
            <Calendar className="w-12 h-12 text-zinc-300 mb-2" />
            <p className="text-xs font-bold text-zinc-650">Nessun appuntamento programmato</p>
            <p className="text-[10px] max-w-[240px] mt-0.5 text-zinc-400 font-semibold leading-relaxed">La tua agenda è libera. Clicca su "Pianifica Incontro" per inserire un appuntamento.</p>
          </div>
        ) : (
          <div className="space-y-6" id="appointments-timeline-grid">
            {/* Timeline cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="appt-cards-grid">
              {filteredAppointments.map((appt) => {
                const isToday = appt.data === todayStr;
                const contactName = getContactName(appt.contatto_id);
                const { day, month, weekday, year } = parseApptDate(appt.data);
                return (
                  <div 
                    key={appt.id} 
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative overflow-hidden group ${
                      isToday 
                        ? 'bg-indigo-50/40 border-indigo-200 shadow-sm shadow-indigo-100/20' 
                        : 'bg-zinc-50/60 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {isToday && (
                      <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-lg bg-indigo-650 text-white text-[9px] font-black tracking-wider uppercase">
                        OGGI
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Top Row: Date Badge and Info */}
                      <div className="flex gap-3.5 items-start">
                        {/* Visual Calendar Badge */}
                        <div className="flex flex-col items-center justify-between shrink-0 w-12 h-14 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                          <div className={`w-full text-center text-[8px] font-black tracking-wider py-0.5 ${
                            isToday ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500 border-b border-zinc-150'
                          }`}>
                            {month}
                          </div>
                          <div className="text-zinc-850 text-base font-black font-sans leading-none my-auto">
                            {day}
                          </div>
                          <div className="w-full text-center text-[8px] text-zinc-400 font-bold border-t border-zinc-50/50 pb-0.5 bg-zinc-50/30">
                            {weekday}
                          </div>
                        </div>

                        {/* Meeting Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`p-1 rounded-lg text-xs ${
                              appt.tipo === 'Video Call' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                              appt.tipo === 'Telefonico' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              appt.tipo === 'Presenziale' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              'bg-zinc-100 text-zinc-600 border border-zinc-200'
                            }`}>
                              {appt.tipo === 'Video Call' && <Video className="w-3 h-3" />}
                              {appt.tipo === 'Telefonico' && <Phone className="w-3 h-3" />}
                              {appt.tipo === 'Presenziale' && <MapPin className="w-3 h-3" />}
                              {appt.tipo === 'Altro' && <Calendar className="w-3 h-3" />}
                            </span>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{appt.tipo}</span>
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-zinc-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1" title={appt.titolo}>
                              {appt.titolo}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span>Ore <strong className="text-zinc-700 font-mono font-bold">{appt.ora}</strong></span>
                              <span className="text-zinc-350">&bull;</span>
                              <span className="text-[9px] text-zinc-400 font-bold font-mono">{year}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Associated Contact & Notes */}
                      <div className="space-y-2">
                        <div className="pt-2 border-t border-zinc-100 space-y-1">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Contatto Associato</span>
                          <div 
                            onClick={() => {
                              onSelectContact(appt.contatto_id);
                              onNavigateToView('contatti');
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-bold inline-flex items-center gap-1.5"
                          >
                            <User className="w-3.5 h-3.5 text-zinc-450" />
                            {contactName}
                          </div>
                        </div>

                        {appt.note && (
                          <p className="text-[10px] text-zinc-600 font-medium italic line-clamp-2 bg-white p-2 rounded-xl border border-zinc-150 leading-relaxed">
                            "{appt.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2" id="card-footer">
                      <button
                        onClick={() => {
                          onSelectContact(appt.contatto_id);
                          onNavigateToView('contatti');
                        }}
                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-700 flex items-center gap-0.5 transition-colors cursor-pointer"
                      >
                        Vedi Scheda <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleDelete(appt.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Elimina Appuntamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Creator */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="appt-form-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl"
              id="appt-form-card"
            >
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between" id="appt-form-header">
                <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Pianifica Nuovo Appuntamento
                </h3>
                <button 
                  onClick={handleCloseCreate} 
                  className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {contacts.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 space-y-3">
                  <p className="text-xs">Devi registrare almeno un contatto in anagrafica prima di poter pianificare incontri in agenda.</p>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      onNavigateToView('contatti');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
                  >
                    Vai ai Contatti
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4" id="appt-modal-form">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Titolo dell'Incontro *</label>
                    <input
                      type="text"
                      required
                      value={titolo}
                      onChange={(e) => setTitolo(e.target.value)}
                      placeholder="es. Video call demo software, Firma contratto..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Contatto Associato *</label>
                    <select
                      value={contattoId}
                      required
                      onChange={(e) => setContattoId(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-850 focus:outline-none focus:border-indigo-500/50 font-semibold"
                    >
                      <option value="" disabled>Scegli un contatto...</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nome} {c.cognome} ({c.tipo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Data *</label>
                      <input
                        type="date"
                        required
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Ora *</label>
                      <input
                        type="time"
                        required
                        value={ora}
                        onChange={(e) => setOra(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tipo Appuntamento</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as AppointmentType)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50 font-semibold"
                    >
                      <option value="Video Call">Video Call</option>
                      <option value="Telefonico">Telefonico</option>
                      <option value="Presenziale">Presenziale</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Note Preparazione Incontro</label>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Obbiettivi dell'incontro, link slide di presentazione, checklist da discutere..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>

                  <div className="border-t border-zinc-100 pt-4 flex justify-end gap-2" id="appt-form-submit-group">
                    <button
                      type="button"
                      onClick={handleCloseCreate}
                      className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-indigo-100 cursor-pointer"
                    >
                      Salva in Agenda
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
