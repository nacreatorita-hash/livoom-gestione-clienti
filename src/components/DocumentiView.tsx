import React, { useState, useEffect } from 'react';
import { Contact, DocumentDrive, DocumentType } from '../types';
import { 
  FolderLock, 
  Plus, 
  Search, 
  X, 
  ExternalLink, 
  Trash2, 
  FileText, 
  AlertTriangle,
  Clock,
  Sparkles,
  Link,
  ChevronRight,
  User,
  Folder,
  FolderOpen,
  Layers,
  ChevronDown,
  Eye,
  ArrowLeft,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentiViewProps {
  contacts: Contact[];
  documents: DocumentDrive[];
  onCreateDocument: (doc: Omit<DocumentDrive, 'id' | 'created_at' | 'user_id'>) => Promise<DocumentDrive>;
  onDeleteDocument: (id: string) => Promise<void>;
  onSelectContact: (contactId: string) => void;
  onNavigateToView: (view: 'dashboard' | 'contatti' | 'chiamate' | 'agenda' | 'documenti') => void;
  preselectedContact: Contact | null;
  clearPreselectedContact: () => void;
}

export default function DocumentiView({
  contacts,
  documents,
  onCreateDocument,
  onDeleteDocument,
  onSelectContact,
  onNavigateToView,
  preselectedContact,
  clearPreselectedContact,
}: DocumentiViewProps) {
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders');
  const [hideEmptyFolders, setHideEmptyFolders] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Reset active folder when changing view mode
  useEffect(() => {
    setActiveFolderId(null);
  }, [viewMode]);

  // Form Fields
  const [contattoId, setContattoId] = useState('');
  const [nomeDocumento, setNomeDocumento] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<DocumentType>('Contratto');
  const [scadenza, setScadenza] = useState('');
  const [linkError, setLinkError] = useState('');

  // Sync pre-selected contact
  useEffect(() => {
    if (preselectedContact) {
      setContattoId(preselectedContact.id);
      setNomeDocumento(`Documento - ${preselectedContact.nome} ${preselectedContact.cognome}`);
      setLinkDrive('');
      setTipoDocumento('Contratto');
      setScadenza('');
      setIsFormOpen(true);
    }
  }, [preselectedContact]);

  const handleOpenCreate = () => {
    setContattoId(contacts[0]?.id || '');
    setNomeDocumento('');
    setLinkDrive('');
    setTipoDocumento('Contratto');
    setScadenza('');
    setLinkError('');
    setIsFormOpen(true);
  };

  const handleCloseCreate = () => {
    setIsFormOpen(false);
    clearPreselectedContact();
  };

  const handleLinkChange = (val: string) => {
    setLinkDrive(val);
    if (val.trim() && !val.includes('drive.google.com') && !val.includes('docs.google.com')) {
      setLinkError('Attenzione: questo non sembra un link ufficiale di Google Drive (drive.google.com o docs.google.com). Puoi salvarlo comunque, ma verifica che sia corretto.');
    } else {
      setLinkError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contattoId || !nomeDocumento.trim() || !linkDrive.trim()) {
      alert('I campi contrassegnati con l\'asterisco (*) sono obbligatori.');
      return;
    }

    try {
      await onCreateDocument({
        contatto_id: contattoId,
        nome_documento: nomeDocumento.trim(),
        link_drive: linkDrive.trim(),
        tipo_documento: tipoDocumento,
        scadenza: scadenza ? scadenza : null
      });
      setIsFormOpen(false);
      clearPreselectedContact();
    } catch (err) {
      console.error('Error attaching document', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler scollegare questo documento? Il collegamento verrà eliminato ma il file rimarrà intatto su Google Drive.')) {
      try {
        await onDeleteDocument(id);
      } catch (err) {
        console.error('Error deleting document linkage', err);
      }
    }
  };

  const getContactName = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    return contact ? `${contact.nome} ${contact.cognome}` : 'Contatto Sconosciuto';
  };

  // Filtered documents
  const filteredDocuments = documents.filter(doc => {
    const contactName = getContactName(doc.contatto_id).toLowerCase();
    const matchSearch = doc.nome_documento.toLowerCase().includes(searchTerm.toLowerCase()) || contactName.includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'all' || doc.tipo_documento === typeFilter;
    return matchSearch && matchType;
  });

  // Filtered contacts (folders) based on search and filters
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.nome} ${contact.cognome}`.toLowerCase();
    const contactDocs = documents.filter(d => d.contatto_id === contact.id);

    // If "Nascondi vuote" is active and contact has no documents, filter out
    if (hideEmptyFolders && contactDocs.length === 0) {
      return false;
    }

    const matchesContactSearch = fullName.includes(searchTerm.toLowerCase());

    // Check if any document inside this contact matches search or type
    const matchesDoc = contactDocs.some(doc => {
      const matchDocName = doc.nome_documento.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDocType = typeFilter === 'all' || doc.tipo_documento === typeFilter;
      return matchDocName && matchDocType;
    });

    // If type filter is active, only show contacts that have at least one document of that type
    if (typeFilter !== 'all') {
      const hasMatchingTypeDoc = contactDocs.some(doc => doc.tipo_documento === typeFilter);
      if (!hasMatchingTypeDoc) return false;
    }

    if (searchTerm) {
      return matchesContactSearch || matchesDoc;
    }

    return true;
  });

  // Sort filtered contacts alphabetically by first name and last name
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const nameA = `${a.nome} ${a.cognome}`.toLowerCase();
    const nameB = `${b.nome} ${b.cognome}`.toLowerCase();
    return nameA.localeCompare(nameB, 'it-IT');
  });

  const activeContact = contacts.find(c => c.id === activeFolderId);
  const activeContactDocs = activeContact 
    ? documents.filter(d => d.contatto_id === activeContact.id && (
        typeFilter === 'all' || d.tipo_documento === typeFilter
      ) && (
        !searchTerm || d.nome_documento.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    : [];

  return (
    <div className="h-full flex flex-col gap-5" id="documenti-view-root">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="documenti-header">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 tracking-tight flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-indigo-600" />
            Documenti Google Drive
          </h2>
          <p className="text-xs text-zinc-400 font-semibold">Collega e organizza contratti, fatture e preventivi salvati su Google Drive</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer"
          id="btn-add-doc"
        >
          <Plus className="w-4 h-4" />
          Collega Documento
        </button>
      </div>

      {/* Filters Area */}
      <div className="p-4 bg-white border border-zinc-200 rounded-3xl flex flex-col xl:flex-row gap-3 shadow-sm items-stretch xl:items-center" id="documenti-filters">
        
        {/* View Switcher */}
        <div className="flex bg-zinc-100 rounded-xl p-1 gap-1 shrink-0 self-start xl:self-auto" id="doc-view-switcher">
          <button
            type="button"
            onClick={() => setViewMode('folders')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'folders' 
                ? 'bg-white text-zinc-800 shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-indigo-500" />
            Cartelle Clienti
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-white text-zinc-800 shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            Tutti i File
          </button>
        </div>

        <div className="relative flex-1" id="doc-filter-search">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={viewMode === 'folders' ? "Cerca cartella o documento..." : "Cerca per nome documento o contatto..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-750 focus:outline-none focus:border-indigo-500/50 transition-colors font-semibold min-w-[150px]"
            id="doc-filter-type"
          >
            <option value="all">Tutti i Documenti</option>
            <option value="Contratto">Contratto</option>
            <option value="Preventivo">Preventivo</option>
            <option value="Fattura">Fattura</option>
            <option value="Identità">Identità</option>
            <option value="Altro">Altro</option>
          </select>

          {viewMode === 'folders' && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-550 select-none bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 px-3.5 py-2 rounded-xl transition-colors shrink-0">
              <input
                type="checkbox"
                checked={hideEmptyFolders}
                onChange={(e) => setHideEmptyFolders(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              Nascondi cartelle vuote
            </label>
          )}
        </div>
      </div>

      {/* Main List Grid */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm" id="documenti-board-container">
        {viewMode === 'folders' ? (
          sortedContacts.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center text-zinc-400" id="docs-empty-folders-state">
              <FolderLock className="w-12 h-12 text-zinc-300 mb-2" />
              <p className="text-xs font-bold text-zinc-650">Nessuna cartella trovata</p>
              <p className="text-[10px] max-w-[240px] mt-0.5 text-zinc-400 font-semibold leading-relaxed">
                Non ci sono clienti o documenti corrispondenti ai criteri di ricerca impostati.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="docs-folders-grid">
              {filteredContacts.map((contact) => {
                const contactDocs = documents.filter(d => d.contatto_id === contact.id);
                const isExpanded = !!expandedFolders[contact.id];
                
                // Color theme by contact type
                const colorTheme = 
                  contact.tipo === 'Cliente' ? {
                    text: 'text-emerald-700',
                    bg: 'bg-emerald-50/50',
                    border: 'border-emerald-100',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-150',
                    folderFill: 'text-emerald-500 fill-emerald-100/60'
                  } :
                  contact.tipo === 'Prospect' ? {
                    text: 'text-purple-700',
                    bg: 'bg-purple-50/50',
                    border: 'border-purple-100',
                    badge: 'bg-purple-50 text-purple-700 border-purple-150',
                    folderFill: 'text-purple-500 fill-purple-100/60'
                  } :
                  contact.tipo === 'Lead' ? {
                    text: 'text-blue-700',
                    bg: 'bg-blue-50/50',
                    border: 'border-blue-100',
                    badge: 'bg-blue-50 text-blue-700 border-blue-150',
                    folderFill: 'text-blue-500 fill-blue-100/60'
                  } : { // Partner or others
                    text: 'text-amber-700',
                    bg: 'bg-amber-50/50',
                    border: 'border-amber-100',
                    badge: 'bg-amber-50 text-amber-700 border-amber-150',
                    folderFill: 'text-amber-500 fill-amber-100/60'
                  };

                return (
                  <div 
                    key={contact.id} 
                    onClick={() => setExpandedFolders(prev => ({ ...prev, [contact.id]: !prev[contact.id] }))}
                    className={`p-4 rounded-3xl bg-zinc-50/45 border hover:shadow-md hover:border-zinc-300 hover:bg-zinc-50 transition-all flex flex-col gap-3 relative select-none cursor-pointer ${
                      isExpanded ? 'border-zinc-300 shadow-sm bg-white' : 'border-zinc-200'
                    }`}
                  >
                    {/* Folder Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <FolderOpen className={`w-8 h-8 ${colorTheme.folderFill} transition-transform duration-150`} />
                        ) : (
                          <Folder className={`w-8 h-8 ${colorTheme.folderFill} transition-transform duration-150`} />
                        )}
                        <div>
                          <h3 className="text-xs font-extrabold text-zinc-800 tracking-tight leading-tight">
                            {contact.nome} {contact.cognome}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border uppercase ${colorTheme.badge}`}>
                              {contact.tipo}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* File Count and Quick Add */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${
                          contactDocs.length > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                        }`}>
                          {contactDocs.length === 1 ? '1 file' : `${contactDocs.length} file`}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setContattoId(contact.id);
                            setNomeDocumento(`Documento - ${contact.nome} ${contact.cognome}`);
                            setLinkDrive('');
                            setTipoDocumento('Contratto');
                            setScadenza('');
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition-colors cursor-pointer"
                          title="Aggiungi file a questa cartella"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Folder Preview of first 2 files (when collapsed) */}
                    {!isExpanded && contactDocs.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {contactDocs.slice(0, 2).map(doc => (
                          <div key={doc.id} className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold bg-white border border-zinc-150 p-1.5 rounded-xl truncate">
                            <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate flex-1">{doc.nome_documento}</span>
                          </div>
                        ))}
                        {contactDocs.length > 2 && (
                          <div className="text-[9px] text-zinc-400 font-extrabold flex items-center gap-1 px-1 pt-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                            e altri {contactDocs.length - 2} documenti...
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expandable content area */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="border-t border-zinc-100 pt-3 mt-1 space-y-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <span>File contenuti ({contactDocs.length})</span>
                            <button
                              type="button"
                              onClick={() => {
                                setContattoId(contact.id);
                                setNomeDocumento(`Documento - ${contact.nome} ${contact.cognome}`);
                                setLinkDrive('');
                                setTipoDocumento('Contratto');
                                setScadenza('');
                                setIsFormOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-extrabold cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Aggiungi File
                            </button>
                          </div>

                          {contactDocs.length === 0 ? (
                            <div className="py-6 text-center text-zinc-400 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                              <Folder className="w-6 h-6 mx-auto mb-1 text-zinc-300" />
                              <p className="text-[10px] font-semibold text-zinc-400">Questa cartella è vuota</p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {contactDocs.map(doc => (
                                <div key={doc.id} className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between gap-3 text-xs hover:bg-zinc-100/50 transition-colors animate-fade-in">
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                                        doc.tipo_documento === 'Contratto' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        doc.tipo_documento === 'Preventivo' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        doc.tipo_documento === 'Fattura' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        'bg-zinc-150 text-zinc-650 border-zinc-200'
                                      }`}>
                                        {doc.tipo_documento}
                                      </span>
                                      {doc.scadenza && (
                                        <span className="text-[8px] text-rose-650 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                                          <Clock className="w-2.5 h-2.5 text-rose-500" />
                                          scad: {new Date(doc.scadenza).toLocaleDateString('it-IT')}
                                        </span>
                                      )}
                                    </div>
                                    <h5 className="font-bold text-zinc-750 truncate text-[11px]" title={doc.nome_documento}>
                                      {doc.nome_documento}
                                    </h5>
                                    <div className="text-[9px] text-zinc-400 font-semibold truncate">
                                      {doc.link_drive}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <a 
                                      href={doc.link_drive} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="p-1 text-indigo-650 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                      title="Apri documento"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(doc.id)}
                                      className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Scollega documento"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Chevron Indicator */}
                    <div className="flex justify-center border-t border-zinc-100/50 pt-1.5 mt-auto">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-650 transition-colors" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-650 transition-colors" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          filteredDocuments.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center text-zinc-400" id="docs-empty-state">
              <FolderLock className="w-12 h-12 text-zinc-300 mb-2" />
              <p className="text-xs font-bold text-zinc-650">Nessun documento collegato</p>
              <p className="text-[10px] max-w-[240px] mt-0.5 text-zinc-400 font-semibold leading-relaxed">
                Collega contratti o cartelle Google Drive ai rispettivi clienti per averli sempre a portata di mano.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="docs-grid">
              {filteredDocuments.map((doc) => {
                const contactName = getContactName(doc.contatto_id);
                
                return (
                  <div 
                    key={doc.id} 
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all flex flex-col justify-between gap-3 relative overflow-hidden group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          doc.tipo_documento === 'Contratto' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          doc.tipo_documento === 'Preventivo' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          doc.tipo_documento === 'Fattura' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}>
                          {doc.tipo_documento}
                        </span>

                        {doc.scadenza && (
                          <span className="text-[9px] text-zinc-500 font-bold font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-zinc-200">
                            <Clock className="w-2.5 h-2.5 text-zinc-400" />
                            Scadenza: {new Date(doc.scadenza).toLocaleDateString('it-IT')}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-800 line-clamp-2" title={doc.nome_documento}>
                          {doc.nome_documento}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-400" />
                          Collegato a:{' '}
                          <span 
                            onClick={() => {
                              onSelectContact(doc.contatto_id);
                              onNavigateToView('contatti');
                            }}
                            className="text-indigo-600 hover:text-indigo-750 hover:underline cursor-pointer font-bold"
                          >
                            {contactName}
                          </span>
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-white border border-zinc-150 flex items-center justify-between gap-2 text-[10px] shadow-2xs">
                        <span className="text-zinc-400 font-medium truncate">{doc.link_drive}</span>
                        <a 
                          href={doc.link_drive} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-750 shrink-0 flex items-center gap-0.5 font-bold cursor-pointer"
                          title="Apri in un'altra scheda"
                        >
                          Apri <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-[10px]" id="doc-card-footer">
                      <span className="text-[9px] text-zinc-400 font-semibold">
                        Caricato: {new Date(doc.created_at).toLocaleDateString('it-IT')}
                      </span>

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="Scollega Documento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Modal Creator */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="doc-form-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl"
              id="doc-form-card"
            >
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between" id="doc-form-header">
                <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                  <FolderLock className="w-4 h-4 text-indigo-600" />
                  Collega Link Google Drive
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
                  <p className="text-xs">Devi registrare almeno un contatto in anagrafica prima di poter associare documenti Google Drive.</p>
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
                <form onSubmit={handleSubmit} className="p-5 space-y-4" id="doc-modal-form">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Contatto Proprietario *</label>
                    <select
                      value={contattoId}
                      required
                      onChange={(e) => setContattoId(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-855 focus:outline-none focus:border-indigo-500/50 font-semibold"
                    >
                      <option value="" disabled>Scegli un contatto...</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nome} {c.cognome} ({c.tipo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Nome Documento *</label>
                    <input
                      type="text"
                      required
                      value={nomeDocumento}
                      onChange={(e) => setNomeDocumento(e.target.value)}
                      placeholder="es. Accordo di riservatezza NDA Rossi, Fattura 123..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1">
                      Link Condivisione Google Drive *
                      <Link className="w-3 h-3 text-zinc-400" />
                    </label>
                    <input
                      type="url"
                      required
                      value={linkDrive}
                      onChange={(e) => handleLinkChange(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50"
                    />
                    {linkError && (
                      <div className="mt-1.5 p-2 bg-amber-50 border border-amber-100 rounded-xl text-[9px] text-amber-700 flex items-start gap-1.5 leading-relaxed font-semibold shadow-2xs">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-650" />
                        <span>{linkError}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tipo Documento</label>
                      <select
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value as DocumentType)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50 font-semibold"
                      >
                        <option value="Contratto">Contratto</option>
                        <option value="Preventivo">Preventivo</option>
                        <option value="Fattura">Fattura</option>
                        <option value="Identità">Identità</option>
                        <option value="Altro">Altro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Data Scadenza (Opzionale)</label>
                      <input
                        type="date"
                        value={scadenza}
                        onChange={(e) => setScadenza(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-4 flex justify-end gap-2" id="doc-form-submit-group">
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
                      Salva Collegamento
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
