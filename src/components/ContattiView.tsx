import React, { useState, useEffect } from 'react';
import { Contact, Call, Appointment, DocumentDrive, ContactType, ContactStatus } from '../types';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  PhoneCall, 
  Edit3, 
  Trash2, 
  FolderLock, 
  X, 
  Check, 
  AlertTriangle,
  History,
  Clock,
  Sparkles,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContattiViewProps {
  contacts: Contact[];
  calls: Call[];
  appointments: Appointment[];
  documents: DocumentDrive[];
  onCreateContact: (contact: Omit<Contact, 'id' | 'created_at' | 'user_id'>) => Promise<Contact>;
  onUpdateContact: (id: string, updates: Partial<Omit<Contact, 'id' | 'created_at' | 'user_id'>>) => Promise<Contact>;
  onDeleteContact: (id: string) => Promise<void>;
  
  // Quick links to register children entities
  onAddCall: (contact: Contact) => void;
  onAddAppointment: (contact: Contact) => void;
  onAddDocument: (contact: Contact) => void;
  
  // Active selected contact state from App level (for quick cross-navigation)
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
}

export default function ContattiView({
  contacts,
  calls,
  appointments,
  documents,
  onCreateContact,
  onUpdateContact,
  onDeleteContact,
  onAddCall,
  onAddAppointment,
  onAddDocument,
  selectedContactId,
  setSelectedContactId,
}: ContattiViewProps) {
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all');
  const [sourceNameFilter, setSourceNameFilter] = useState('');
  const [sourceUrlFilter, setSourceUrlFilter] = useState('');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [expandedItem, setExpandedItem] = useState<{
    type: 'chiamata' | 'appuntamento' | 'documento';
    data: any;
  } | null>(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState<ContactType>('Lead');
  const [stato, setStato] = useState<ContactStatus>('Nuovo');
  const [note, setNote] = useState('');
  const [sourceType, setSourceType] = useState<string>('Facebook');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceAcquiredAt, setSourceAcquiredAt] = useState('');
  const [sourceNotes, setSourceNotes] = useState('');

  // Helper to get local date string YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Mobile navigation helper (in mobile we only show one panel at a time)
  const [showDetailMobile, setShowDetailMobile] = useState(false);

  // Sync selected contact from outside or select the first one on load if none selected (desktop)
  useEffect(() => {
    if (selectedContactId) {
      setShowDetailMobile(true);
    }
  }, [selectedContactId]);

  // Handle open form for creation
  const handleOpenCreate = () => {
    setEditingContact(null);
    setNome('');
    setCognome('');
    setTelefono('');
    setEmail('');
    setTipo('Lead');
    setStato('Nuovo');
    setNote('');
    setSourceType('Facebook');
    setSourceUrl('');
    setSourceName('');
    setSourceAcquiredAt(getTodayString());
    setSourceNotes('');
    setIsFormOpen(true);
  };

  // Handle open form for edit
  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNome(contact.nome);
    setCognome(contact.cognome);
    setTelefono(contact.telefono);
    setEmail(contact.email);
    setTipo(contact.tipo);
    setStato(contact.stato);
    setNote(contact.note);
    setSourceType(contact.source_type || 'Facebook');
    setSourceUrl(contact.source_url || '');
    setSourceName(contact.source_name || '');
    setSourceAcquiredAt(contact.source_acquired_at || getTodayString());
    setSourceNotes(contact.source_notes || '');
    setIsFormOpen(true);
  };

  // Handle submit contact (Create/Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cognome.trim()) return;

    const contactPayload = {
      nome: nome.trim(),
      cognome: cognome.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      tipo,
      stato,
      note: note.trim(),
      source_type: sourceType,
      source_url: sourceUrl.trim(),
      source_name: sourceName.trim(),
      source_acquired_at: sourceAcquiredAt,
      source_notes: sourceNotes.trim()
    };

    try {
      if (editingContact) {
        const updated = await onUpdateContact(editingContact.id, contactPayload);
        setSelectedContactId(updated.id);
      } else {
        const created = await onCreateContact(contactPayload);
        setSelectedContactId(created.id);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving contact', err);
    }
  };

  // Handle delete contact
  const handleDelete = async (contactId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo contatto? Verranno eliminate anche tutte le chiamate, appuntamenti e documenti associati.')) {
      try {
        await onDeleteContact(contactId);
        setSelectedContactId(null);
        setShowDetailMobile(false);
      } catch (err) {
        console.error('Error deleting contact', err);
      }
    }
  };

  // Filtering Logic
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.nome} ${contact.cognome}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.telefono.includes(searchTerm);

    const typeMatch = typeFilter === 'all' || contact.tipo === typeFilter;
    const statusMatch = statusFilter === 'all' || contact.stato === statusFilter;

    // Source filtering
    const sourceTypeMatch = sourceTypeFilter === 'all' || contact.source_type === sourceTypeFilter;
    const sourceNameMatch = !sourceNameFilter.trim() || 
      (contact.source_name || '').toLowerCase().includes(sourceNameFilter.toLowerCase());
    const sourceUrlMatch = !sourceUrlFilter.trim() || 
      (contact.source_url || '').toLowerCase().includes(sourceUrlFilter.toLowerCase());

    return searchMatch && typeMatch && statusMatch && sourceTypeMatch && sourceNameMatch && sourceUrlMatch;
  });

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  // Sub-items for the selected contact
  const selectedContactCalls = calls.filter(c => c.contatto_id === selectedContactId);
  const selectedContactAppointments = appointments.filter(a => a.contatto_id === selectedContactId);
  const selectedContactDocuments = documents.filter(d => d.contatto_id === selectedContactId);

  return (
    <div className="h-full flex flex-col gap-5" id="contatti-view-root">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="contatti-header">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Anagrafica Contatti
          </h2>
          <p className="text-xs text-zinc-400 font-semibold">Gestisci i leads, i clienti e le attività del team commerciale</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer"
          id="btn-add-contact"
        >
          <UserPlus className="w-4 h-4" />
          Aggiungi Contatto
        </button>
      </div>

      {/* Filters Area */}
      <div className="p-4 bg-white border border-zinc-200 rounded-3xl flex flex-col gap-3 shadow-sm" id="contatti-filters">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1" id="filter-search-group">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cerca nome, email o telefono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2" id="filter-select-group">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold"
            >
              <option value="all">Tutti i Tipi</option>
              <option value="Lead">Lead</option>
              <option value="Prospect">Prospect</option>
              <option value="Cliente">Cliente</option>
              <option value="Partner">Partner</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold"
            >
              <option value="all">Tutti gli Stati</option>
              <option value="Nuovo">Nuovo</option>
              <option value="In Contatto">In Contatto</option>
              <option value="Trattativa">Trattativa</option>
              <option value="Chiuso Vinto">Chiuso Vinto</option>
              <option value="Chiuso Perso">Chiuso Perso</option>
            </select>
          </div>
        </div>

        {/* Second Row: Origin Filters */}
        <div className="pt-2.5 border-t border-zinc-100 flex flex-col md:flex-row gap-3 items-center">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider md:shrink-0">Filtri Origine:</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-750 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold"
            >
              <option value="all">Tutte le fonti</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Gruppo Facebook">Gruppo Facebook</option>
              <option value="Marketplace">Marketplace</option>
              <option value="Telegram">Telegram</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="TikTok">TikTok</option>
              <option value="Sito web">Sito web</option>
              <option value="Passaparola">Passaparola</option>
              <option value="Altro">Altro</option>
            </select>

            <input
              type="text"
              placeholder="Filtra gruppo/pagina/canale..."
              value={sourceNameFilter}
              onChange={(e) => setSourceNameFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />

            <input
              type="text"
              placeholder="Filtra link origine..."
              value={sourceUrlFilter}
              onChange={(e) => setSourceUrlFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[450px]" id="contatti-grid">
        
        {/* Left Column: List (lg:col-span-2) */}
        <div className={`lg:col-span-2 flex flex-col gap-3 ${showDetailMobile ? 'hidden lg:flex' : 'flex'}`} id="contacts-list-panel">
          <div className="flex items-center justify-between px-1" id="list-panel-header">
            <span className="text-xs font-bold text-zinc-400">{filteredContacts.length} Risultati trovati</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[500px] pr-1" id="contacts-list-scroll">
            {filteredContacts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                <Users className="w-10 h-10 text-zinc-300 mb-2" />
                <p className="text-xs font-bold text-zinc-600">Nessun contatto</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Modifica i filtri o aggiungi un contatto per iniziare.</p>
              </div>
            ) : (
              filteredContacts.map(contact => {
                const isSelected = contact.id === selectedContactId;
                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      setShowDetailMobile(true);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-indigo-50/60 border-indigo-200 shadow-sm' 
                        : 'bg-white border-zinc-200/80 hover:bg-zinc-50/50'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-800 truncate">{contact.nome} {contact.cognome}</span>
                        <span className={`text-[8px] font-bold px-1 py-0.2 rounded ${
                          contact.tipo === 'Lead' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          contact.tipo === 'Cliente' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          contact.tipo === 'Prospect' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                          {contact.tipo}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-semibold truncate">{contact.telefono || 'Nessun telefono'}</p>
                      <p className="text-[10px] text-zinc-400 font-semibold truncate">{contact.email || 'Nessuna email'}</p>
                      {contact.source_type && (
                        <span className="inline-flex mt-1 text-[9px] text-indigo-600 font-bold bg-indigo-50/50 px-1.5 py-0.2 rounded border border-indigo-100/50 truncate max-w-[200px]">
                          Fonte: {contact.source_type} {contact.source_name ? `(${contact.source_name})` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        contact.stato === 'Nuovo' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                        contact.stato === 'In Contatto' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        contact.stato === 'Trattativa' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        contact.stato === 'Chiuso Vinto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {contact.stato}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Scheda Dettaglio (lg:col-span-3) */}
        <div className={`lg:col-span-3 flex flex-col ${!showDetailMobile ? 'hidden lg:flex' : 'flex'}`} id="contacts-detail-panel">
          {selectedContact ? (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-200 rounded-3xl p-5 md:p-6 flex flex-col h-full gap-5 shadow-sm"
              id="detail-card"
            >
              {/* Back Button for Mobile */}
              <button
                onClick={() => setShowDetailMobile(false)}
                className="lg:hidden self-start flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-bold mb-2 cursor-pointer"
                id="back-to-list-btn"
              >
                <ChevronLeft className="w-4 h-4" /> Torna alla lista
              </button>

              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 pb-5" id="detail-header">
                <div className="flex items-center gap-3.5" id="detail-avatar-group">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-lg tracking-tight flex items-center justify-center font-sans">
                    {selectedContact.nome[0].toUpperCase()}{selectedContact.cognome[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-800 leading-tight">{selectedContact.nome} {selectedContact.cognome}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5" id="detail-badges">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-600 uppercase">
                        {selectedContact.tipo}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedContact.stato === 'Nuovo' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                        selectedContact.stato === 'In Contatto' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        selectedContact.stato === 'Trattativa' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        selectedContact.stato === 'Chiuso Vinto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {selectedContact.stato}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Action buttons for Contact */}
                <div className="flex items-center gap-1.5 flex-wrap" id="detail-actions">
                  <button
                    onClick={() => handleOpenEdit(selectedContact)}
                    className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-800 hover:border-zinc-300 transition-colors cursor-pointer"
                    title="Modifica Contatto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedContact.id)}
                    className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-100 transition-colors cursor-pointer"
                    title="Elimina Contatto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="detail-card-info">
                <div className="space-y-3.5" id="info-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Recapiti Telefonici</span>
                    <p className="text-xs text-zinc-800 font-bold flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {selectedContact.telefono || <span className="text-zinc-300 italic font-semibold">Non specificato</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Indirizzo Email</span>
                    <p className="text-xs text-zinc-800 font-bold flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      {selectedContact.email || <span className="text-zinc-300 italic font-semibold">Non specificata</span>}
                    </p>
                  </div>
                </div>

                <div className="space-y-1" id="info-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Note / Informazioni Commerciali</span>
                  <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs text-zinc-600 font-medium leading-relaxed max-h-[100px] overflow-y-auto italic">
                    {selectedContact.note || <span className="text-zinc-300 italic">Nessuna nota aggiuntiva per questo contatto.</span>}
                  </div>
                </div>
              </div>

              {/* Origine Contatto Panel */}
              <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl space-y-3" id="detail-origine-contatto">
                <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Origine Contatto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Fonte</span>
                    <span className="inline-flex px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {selectedContact.source_type || 'Facebook'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Canale / Pagina / Gruppo</span>
                    <span className="text-zinc-700 font-bold block mt-1 truncate" title={selectedContact.source_name}>
                      {selectedContact.source_name || <span className="text-zinc-300 italic font-medium">-</span>}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Data Acquisizione</span>
                    <span className="text-zinc-700 font-semibold block mt-1 font-mono">
                      {selectedContact.source_acquired_at ? new Date(selectedContact.source_acquired_at).toLocaleDateString('it-IT') : '-'}
                    </span>
                  </div>
                </div>
                
                {selectedContact.source_url && (
                  <div className="pt-2 border-t border-indigo-100/60 flex items-center gap-2 text-xs">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Link Origine:</span>
                    <a 
                      href={selectedContact.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 font-bold truncate max-w-xs sm:max-w-md cursor-pointer"
                    >
                      {selectedContact.source_url}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}

                {selectedContact.source_notes && (
                  <div className="pt-2 border-t border-indigo-100/60">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Note Origine</span>
                    <p className="text-xs text-zinc-650 italic leading-relaxed bg-white p-2.5 rounded-lg border border-zinc-150">{selectedContact.source_notes}</p>
                  </div>
                )}
              </div>

              {/* Action shortcuts with logs */}
              <div className="border-t border-zinc-100 pt-5 space-y-4 flex-1 flex flex-col justify-between" id="detail-tabs">
                
                <div className="space-y-4" id="related-history-container">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider px-1">Storico Relazione e Attività</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="related-grids">
                    {/* Related Calls */}
                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-sm" id="tab-calls">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                        <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase">
                          <History className="w-3 h-3 text-indigo-600" /> Chiamate ({selectedContactCalls.length})
                        </span>
                        <button 
                          onClick={() => onAddCall(selectedContact)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                          + Log
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {selectedContactCalls.length === 0 ? (
                          <p className="text-[10px] text-zinc-400 font-semibold italic">Nessuna chiamata registrata.</p>
                        ) : (
                          selectedContactCalls.map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => setExpandedItem({ type: 'chiamata', data: c })}
                              className="p-2 rounded bg-white border border-zinc-150 hover:border-indigo-400 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer space-y-1"
                              title="Clicca per espandere"
                            >
                              <div className="flex items-center justify-between gap-1 text-[9px] font-semibold">
                                <span className="font-bold text-zinc-700 truncate">{c.esito}</span>
                                <span className="text-zinc-400 shrink-0">{new Date(c.data_chiamata).toLocaleDateString('it-IT')}</span>
                              </div>
                              {c.nota && <p className="text-[9px] text-zinc-500 italic line-clamp-1">"{c.nota}"</p>}
                              {c.prossimo_richiamo && (
                                <p className="text-[8px] text-amber-700 font-bold">Richiamare il: {new Date(c.prossimo_richiamo).toLocaleDateString('it-IT')}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Related Appointments */}
                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-sm" id="tab-agenda">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                        <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase">
                          <Calendar className="w-3 h-3 text-emerald-600" /> Agenda ({selectedContactAppointments.length})
                        </span>
                        <button 
                          onClick={() => onAddAppointment(selectedContact)}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        >
                          + Pianifica
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {selectedContactAppointments.length === 0 ? (
                          <p className="text-[10px] text-zinc-400 font-semibold italic">Nessun appuntamento.</p>
                        ) : (
                          selectedContactAppointments.map(a => (
                            <div 
                              key={a.id} 
                              onClick={() => setExpandedItem({ type: 'appuntamento', data: a })}
                              className="p-2 rounded bg-white border border-zinc-150 hover:border-emerald-400 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer space-y-1"
                              title="Clicca per espandere"
                            >
                              <div className="flex items-center justify-between gap-1 text-[9px] font-semibold">
                                <span className="font-bold text-zinc-700 truncate">{a.titolo}</span>
                                <span className="text-zinc-400 shrink-0">{a.ora}</span>
                              </div>
                              <p className="text-[8px] text-zinc-500 font-bold">Data: {new Date(a.data).toLocaleDateString('it-IT')}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Related Docs */}
                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-sm" id="tab-docs">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                        <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase">
                          <FolderLock className="w-3 h-3 text-purple-600" /> Drive ({selectedContactDocuments.length})
                        </span>
                        <button 
                          onClick={() => onAddDocument(selectedContact)}
                          className="text-[10px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                        >
                          + Link
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {selectedContactDocuments.length === 0 ? (
                          <p className="text-[10px] text-zinc-400 font-semibold italic">Nessun documento.</p>
                        ) : (
                          selectedContactDocuments.map(d => (
                            <div 
                              key={d.id} 
                              onClick={() => setExpandedItem({ type: 'documento', data: d })}
                              className="p-2 rounded bg-white border border-zinc-150 hover:border-purple-400 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer space-y-1"
                              title="Clicca per espandere"
                            >
                              <div className="flex items-center justify-between gap-1 text-[9px] font-semibold">
                                <span className="font-bold text-zinc-700 truncate">{d.nome_documento}</span>
                                <a 
                                  href={d.link_drive} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-indigo-600 hover:text-indigo-700 text-[10px] shrink-0 p-0.5 hover:bg-zinc-100 rounded cursor-pointer"
                                  title="Apri in Google Drive"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              <p className="text-[8px] text-zinc-400 font-semibold">{d.tipo_documento}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          ) : (
            <div className="h-full bg-white border border-zinc-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8 text-zinc-400" id="detail-placeholder">
              <Users className="w-12 h-12 text-zinc-300 mb-2" />
              <p className="text-xs font-bold text-zinc-600">Seleziona un contatto</p>
              <p className="text-[10px] max-w-[240px] mt-0.5 text-zinc-400 font-semibold leading-relaxed">Seleziona un record dalla lista di sinistra per visualizzare la scheda dettagliata e lo storico delle attività.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal Contact Creator/Editor */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="contact-form-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl"
              id="contact-form-card"
            >
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between" id="form-header">
                <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  {editingContact ? 'Modifica Contatto' : 'Nuovo Contatto'}
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4" id="contact-modal-form">
                <div className="grid grid-cols-2 gap-4" id="form-grid-names">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="es. Mario"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Cognome *</label>
                    <input
                      type="text"
                      required
                      value={cognome}
                      onChange={(e) => setCognome(e.target.value)}
                      placeholder="es. Rossi"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4" id="form-grid-contacts">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Telefono</label>
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+39 333 ..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mario.rossi@email.it"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4" id="form-grid-selectors">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tipo Contatto</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as ContactType)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50 font-semibold"
                    >
                      <option value="Lead">Lead</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Partner">Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Stato</label>
                    <select
                      value={stato}
                      onChange={(e) => setStato(e.target.value as ContactStatus)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50 font-semibold"
                    >
                      <option value="Nuovo">Nuovo</option>
                      <option value="In Contatto">In Contatto</option>
                      <option value="Trattativa">Trattativa</option>
                      <option value="Chiuso Vinto">Chiuso Vinto</option>
                      <option value="Chiuso Perso">Chiuso Perso</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Note Libere / Esigenze</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Dettagli sulle richieste o accordi presi..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>

                {/* Section: Origine Contatto */}
                <div className="border-t border-zinc-100 pt-3.5 space-y-4" id="form-section-origine">
                  <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Origine Contatto
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Fonte Contatto *</label>
                      <select
                        value={sourceType}
                        onChange={(e) => setSourceType(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50 font-semibold"
                      >
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Gruppo Facebook">Gruppo Facebook</option>
                        <option value="Marketplace">Marketplace</option>
                        <option value="Telegram">Telegram</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Sito web">Sito web</option>
                        <option value="Passaparola">Passaparola</option>
                        <option value="Altro">Altro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Data Acquisizione *</label>
                      <input
                        type="date"
                        required
                        value={sourceAcquiredAt}
                        onChange={(e) => setSourceAcquiredAt(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50 font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Nome Gruppo/Pagina/Canale</label>
                      <input
                        type="text"
                        value={sourceName}
                        onChange={(e) => setSourceName(e.target.value)}
                        placeholder="es. Affitti studenti Napoli"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Link Origine (URL)</label>
                      <input
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Note Origine</label>
                    <textarea
                      rows={2}
                      value={sourceNotes}
                      onChange={(e) => setSourceNotes(e.target.value)}
                      placeholder="Proprietario trovato da annuncio Facebook, affitta stanza zona Fuorigrotta..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-4 flex justify-end gap-2" id="form-submit-group">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-indigo-100 cursor-pointer"
                  >
                    Salva Modifiche
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedItem && (
          <div className="fixed inset-0 bg-zinc-950/45 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="board-card-expanded-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl p-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  {expandedItem.type === 'chiamata' && (
                    <>
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <History className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-800">Dettaglio Chiamata</h3>
                    </>
                  )}
                  {expandedItem.type === 'appuntamento' && (
                    <>
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-800">Dettaglio Appuntamento</h3>
                    </>
                  )}
                  {expandedItem.type === 'documento' && (
                    <>
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
                        <FolderLock className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-800">Dettaglio Documento Drive</h3>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => setExpandedItem(null)} 
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content body based on type */}
              <div className="space-y-4">
                {expandedItem.type === 'chiamata' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-50">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Esito</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                        expandedItem.data.esito === 'Risposto' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        expandedItem.data.esito === 'Appuntamento fissato' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        expandedItem.data.esito === 'Non risposto' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        expandedItem.data.esito === 'Non interessato' ? 'bg-zinc-50 text-zinc-500 border-zinc-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {expandedItem.data.esito}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Data Chiamata</span>
                        <span className="text-zinc-700 font-bold font-mono mt-0.5 block">
                          {new Date(expandedItem.data.data_chiamata).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      {expandedItem.data.prossimo_richiamo && (
                        <div>
                          <span className="text-[10px] font-bold text-amber-700 uppercase block">Richiamo</span>
                          <span className="text-amber-700 font-bold font-mono inline-flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded mt-0.5">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {new Date(expandedItem.data.prossimo_richiamo).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nota / Resoconto</span>
                      <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3.5 text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed italic">
                        "{expandedItem.data.nota || 'Nessun dettaglio inserito.'}"
                      </div>
                    </div>
                  </div>
                )}

                {expandedItem.type === 'appuntamento' && (
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Titolo Appuntamento</span>
                      <span className="text-sm font-bold text-zinc-800 block mt-0.5">{expandedItem.data.titolo}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Data</span>
                        <span className="text-zinc-700 font-bold font-mono mt-0.5 block">
                          {new Date(expandedItem.data.data).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Ora</span>
                        <span className="text-zinc-700 font-bold font-mono mt-0.5 block">
                          {expandedItem.data.ora}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pb-1 border-b border-zinc-50">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Tipo</span>
                        <span className="inline-flex mt-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
                          {expandedItem.data.tipo}
                        </span>
                      </div>
                    </div>

                    {expandedItem.data.note && (
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Note</span>
                        <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3.5 text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed italic">
                          "{expandedItem.data.note}"
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {expandedItem.type === 'documento' && (
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Nome Documento</span>
                      <span className="text-sm font-bold text-zinc-800 block mt-0.5">{expandedItem.data.nome_documento}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Tipo Documento</span>
                        <span className="inline-flex mt-1 text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded">
                          {expandedItem.data.tipo_documento}
                        </span>
                      </div>
                      {expandedItem.data.scadenza && (
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase block">Scadenza</span>
                          <span className="text-rose-600 font-bold font-mono mt-1 block">
                            {new Date(expandedItem.data.scadenza).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-100">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Google Drive Link</span>
                      <a 
                        href={expandedItem.data.link_drive} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 border border-indigo-150 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors shadow-xs cursor-pointer"
                      >
                        Apri in Google Drive
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setExpandedItem(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
