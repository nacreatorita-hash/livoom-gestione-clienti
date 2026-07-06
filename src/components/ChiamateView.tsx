import React, { useState, useEffect } from 'react';
import { Contact, Call, CallOutcome } from '../types';
import { 
  PhoneCall, 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  Search, 
  CheckCircle2, 
  HelpCircle,
  X,
  PhoneOutgoing,
  CornerDownRight,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChiamateViewProps {
  contacts: Contact[];
  calls: Call[];
  onCreateCall: (call: Omit<Call, 'id' | 'created_at' | 'user_id'>) => Promise<Call>;
  onDeleteCall: (id: string) => Promise<void>;
  onSelectContact: (contactId: string) => void;
  onNavigateToView: (view: 'dashboard' | 'contatti' | 'chiamate' | 'agenda' | 'documenti') => void;
  preselectedContact: Contact | null;
  clearPreselectedContact: () => void;
}

export default function ChiamateView({
  contacts,
  calls,
  onCreateCall,
  onDeleteCall,
  onSelectContact,
  onNavigateToView,
  preselectedContact,
  clearPreselectedContact,
}: ChiamateViewProps) {
  
  // View states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Form Fields
  const [contattoId, setContattoId] = useState('');
  const [dataChiamata, setDataChiamata] = useState('');
  const [esito, setEsito] = useState<CallOutcome>('Risposto');
  const [nota, setNota] = useState('');
  const [prossimoRichiamo, setProssimoRichiamo] = useState('');

  // Handle pre-selection of contact
  useEffect(() => {
    if (preselectedContact) {
      setContattoId(preselectedContact.id);
      
      // Default data_chiamata to now
      const now = new Date();
      // Format to YYYY-MM-DDTHH:MM
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
      setDataChiamata(localISOTime);
      
      setIsFormOpen(true);
    }
  }, [preselectedContact]);

  const handleOpenCreate = () => {
    setContattoId(contacts[0]?.id || '');
    
    // Set default date and time
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setDataChiamata(localISOTime);
    
    setEsito('Risposto');
    setNota('');
    setProssimoRichiamo('');
    setIsFormOpen(true);
  };

  const handleCloseCreate = () => {
    setIsFormOpen(false);
    clearPreselectedContact();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contattoId) {
      alert('Seleziona un contatto prima di salvare.');
      return;
    }

    try {
      await onCreateCall({
        contatto_id: contattoId,
        data_chiamata: new Date(dataChiamata).toISOString(),
        esito,
        nota: nota.trim(),
        prossimo_richiamo: prossimoRichiamo ? prossimoRichiamo : null
      });
      setIsFormOpen(false);
      clearPreselectedContact();
      // Reset form
      setNota('');
      setProssimoRichiamo('');
    } catch (err) {
      console.error('Error recording call', err);
    }
  };

  const handleDeleteCall = async (call: Call) => {
    const contactName = getContactName(call.contatto_id);
    if (!window.confirm(`Eliminare la chiamata registrata per ${contactName}? Questa operazione non può essere annullata.`)) return;
    try {
      await onDeleteCall(call.id);
    } catch (err) {
      console.error('Error deleting call', err);
    }
  };

  const getContactName = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    return contact ? `${contact.nome} ${contact.cognome}` : 'Contatto Sconosciuto';
  };

  const getContactType = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    return contact ? contact.tipo : '';
  };

  // Filtering Logic
  const filteredCalls = calls.filter(call => {
    const contactName = getContactName(call.contatto_id).toLowerCase();
    const searchMatch = contactName.includes(searchTerm.toLowerCase()) || call.nota.toLowerCase().includes(searchTerm.toLowerCase());
    const outcomeMatch = outcomeFilter === 'all' || call.esito === outcomeFilter;
    return searchMatch && outcomeMatch;
  });

  return (
    <div className="h-full flex flex-col gap-5" id="chiamate-view-root">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="chiamate-header">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 tracking-tight flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-indigo-600" />
            Registro Chiamate
          </h2>
          <p className="text-xs text-zinc-400 font-semibold">Registra e monitora le interazioni telefoniche con i tuoi contatti</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer"
          id="btn-add-call"
        >
          <Plus className="w-4 h-4" />
          Registra Chiamata
        </button>
      </div>

      {/* Filters Area */}
      <div className="p-4 bg-white border border-zinc-200 rounded-3xl flex flex-col md:flex-row gap-3 shadow-sm" id="chiamate-filters">
        <div className="relative flex-1" id="call-filter-search">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cerca per nome contatto o parola chiave nella nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value)}
          className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-750 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold"
          id="call-filter-outcome"
        >
          <option value="all">Tutti gli Esiti</option>
          <option value="Risposto">Risposto</option>
          <option value="Non risposto">Non risposto</option>
          <option value="Da richiamare">Da richiamare</option>
          <option value="Non interessato">Non interessato</option>
          <option value="Appuntamento fissato">Appuntamento fissato</option>
        </select>
      </div>

      {/* Main List */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm" id="chiamate-table-container">
        <div className="overflow-x-auto" id="chiamate-table-scroller">
          {filteredCalls.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center text-zinc-400" id="calls-empty-state">
              <PhoneCall className="w-12 h-12 text-zinc-300 mb-2" />
              <p className="text-xs font-bold text-zinc-600">Nessuna chiamata trovata</p>
              <p className="text-[10px] max-w-[240px] mt-0.5 text-zinc-400 font-semibold leading-relaxed">Nessun record corrisponde ai criteri di ricerca impostati.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" id="calls-table">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Contatto</th>
                  <th className="py-3 px-4">Data Chiamata</th>
                  <th className="py-3 px-4">Esito</th>
                  <th className="py-3 px-4">Nota / Resoconto</th>
                  <th className="py-3 px-4">Prossimo Richiamo</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-zinc-800">
                      <div className="flex flex-col">
                        <span 
                          onClick={() => {
                            onSelectContact(call.contatto_id);
                            onNavigateToView('contatti');
                          }}
                          className="hover:text-indigo-600 hover:underline cursor-pointer"
                        >
                          {getContactName(call.contatto_id)}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-bold">{getContactType(call.contatto_id)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-semibold font-mono">
                      {new Date(call.data_chiamata).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        call.esito === 'Risposto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        call.esito === 'Appuntamento fissato' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        call.esito === 'Non risposto' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        call.esito === 'Non interessato' ? 'bg-zinc-100 text-zinc-600 border border-zinc-200' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {call.esito}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-medium max-w-sm whitespace-pre-wrap break-words">
                      {call.nota ? (
                        <div className="text-xs">
                          {call.nota.length <= 80 || expandedNotes[call.id] ? (
                            <span>{call.nota}</span>
                          ) : (
                            <span>{call.nota.slice(0, 80)}...</span>
                          )}
                          {call.nota.length > 80 && (
                            <button
                              type="button"
                              onClick={() => setExpandedNotes(prev => ({ ...prev, [call.id]: !prev[call.id] }))}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 ml-1.5 inline-block focus:outline-none hover:underline cursor-pointer"
                            >
                              {expandedNotes[call.id] ? 'Mostra meno' : 'Leggi tutto'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-300 italic font-semibold">Nessun resoconto</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {call.prossimo_richiamo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          <Clock className="w-3 h-3" />
                          {new Date(call.prossimo_richiamo).toLocaleDateString('it-IT')}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            onSelectContact(call.contatto_id);
                            onNavigateToView('contatti');
                          }}
                          className="p-1.5 rounded-xl hover:bg-zinc-50 text-zinc-400 hover:text-zinc-800 transition-colors inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                        >
                          Vedi Scheda
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCall(call)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Elimina chiamata"
                          aria-label={`Elimina chiamata di ${getContactName(call.contatto_id)}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Creator */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="call-form-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl"
              id="call-form-card"
            >
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between" id="call-form-header">
                <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                  <PhoneOutgoing className="w-4 h-4 text-indigo-600" />
                  Registra Chiamata Commerciale
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
                  <p className="text-xs">Devi registrare almeno un contatto in anagrafica prima di poter loggare chiamate.</p>
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
                <form onSubmit={handleSubmit} className="p-5 space-y-4" id="call-modal-form">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Seleziona Contatto *</label>
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
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Data e Ora *</label>
                      <input
                        type="datetime-local"
                        required
                        value={dataChiamata}
                        onChange={(e) => setDataChiamata(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Esito Telefonata</label>
                      <select
                        value={esito}
                        onChange={(e) => setEsito(e.target.value as CallOutcome)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50 font-semibold"
                      >
                        <option value="Risposto">Risposto</option>
                        <option value="Non risposto">Non risposto</option>
                        <option value="Da richiamare">Da richiamare</option>
                        <option value="Non interessato">Non interessato</option>
                        <option value="Appuntamento fissato">Appuntamento fissato</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Resoconto Conversazione / Note</label>
                    <textarea
                      rows={3}
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      placeholder="Scrivi cosa vi siete detti, accordi commerciali presi..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1">
                      Prossimo Richiamo (Follow-up)
                    </label>
                    <input
                      type="date"
                      value={prossimoRichiamo}
                      onChange={(e) => setProssimoRichiamo(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50"
                    />
                    <p className="text-[9px] text-zinc-400 font-semibold mt-1">Imposta una data per far apparire automaticamente questo contatto sul tuo widget dei richiami in Dashboard.</p>
                  </div>

                  <div className="border-t border-zinc-100 pt-4 flex justify-end gap-2" id="call-form-submit-group">
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
                      Registra Chiamata
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
