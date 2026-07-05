import React, { useMemo, useState } from 'react';
import { CalendarClock, ExternalLink, FileText, Search, User, Pencil, AlertTriangle } from 'lucide-react';
import { Contact, DocumentDrive } from '../types';
import { getDocumentExpiry, getExpiryBadgeClass, getExpiryLabel, parseDateOnly } from '../lib/documentExpiry';

type Filter = 'tutti' | 'scaduti' | 'in-scadenza' | 'validi';

interface Props {
  contacts: Contact[];
  documents: DocumentDrive[];
  onSelectContact: (contactId: string) => void;
  onEditDocument: (document: DocumentDrive) => void;
}

export default function ScadenzeDocumentiView({ contacts, documents, onSelectContact, onEditDocument }: Props) {
  const [filter, setFilter] = useState<Filter>('tutti');
  const [search, setSearch] = useState('');

  const contactName = (id: string) => {
    const contact = contacts.find(item => item.id === id);
    return contact ? `${contact.nome} ${contact.cognome}` : 'Cliente non disponibile';
  };

  const rows = useMemo(() => documents
    .filter(document => Boolean(document.scadenza))
    .map(document => ({ document, expiry: getDocumentExpiry(document)! }))
    .filter(({ document, expiry }) => {
      const needle = search.trim().toLocaleLowerCase('it');
      const matchesSearch = !needle || [document.nome_documento, document.tipo_documento, contactName(document.contatto_id)]
        .some(value => value.toLocaleLowerCase('it').includes(needle));
      const matchesFilter = filter === 'tutti'
        || (filter === 'scaduti' && (expiry.status === 'Scaduto' || expiry.status === 'Scade oggi'))
        || (filter === 'in-scadenza' && expiry.status === 'In scadenza')
        || (filter === 'validi' && expiry.status === 'Valido');
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => parseDateOnly(a.document.scadenza!).getTime() - parseDateOnly(b.document.scadenza!).getTime()),
  [documents, contacts, filter, search]);

  return (
    <div className="space-y-5" id="scadenze-documenti-view">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="expiry-title-icon"><CalendarClock className="w-5 h-5" /></div>
          <h2 className="text-xl font-bold mt-3">Scadenze documenti</h2>
          <p className="text-xs mt-1">Documenti ordinati automaticamente dalla scadenza più urgente.</p>
        </div>
        <span className="expiry-total">{rows.length} {rows.length === 1 ? 'scadenza' : 'scadenze'}</span>
      </div>

      <div className="expiry-toolbar">
        <div className="expiry-search">
          <Search className="w-4 h-4" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Cerca documento, cliente o categoria" aria-label="Cerca scadenze" />
        </div>
        <div className="expiry-segments" role="group" aria-label="Filtra scadenze">
          {([['tutti','Tutti'],['scaduti','Scaduti'],['in-scadenza','In scadenza'],['validi','Validi']] as const).map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>
          ))}
        </div>
      </div>

      <div className="expiry-panel">
        {rows.length === 0 ? (
          <div className="expiry-empty">
            <FileText className="w-10 h-10" />
            <h3>Nessuna scadenza trovata</h3>
            <p>I documenti senza data di scadenza restano disponibili nell’archivio Documenti.</p>
          </div>
        ) : rows.map(({ document, expiry }) => (
          <article className="expiry-row" key={document.id}>
            <div className="expiry-file-icon"><FileText className="w-4 h-4" /></div>
            <div className="expiry-main">
              <h3>{document.nome_documento}</h3>
              <button onClick={() => onSelectContact(document.contatto_id)} className="expiry-client">
                <User className="w-3 h-3" /> {contactName(document.contatto_id)}
              </button>
              {document.nota_scadenza && <p className="expiry-note">{document.nota_scadenza}</p>}
            </div>
            <span className="expiry-category">{document.tipo_documento}</span>
            <div className="expiry-date">
              <strong>{parseDateOnly(document.scadenza!).toLocaleDateString('it-IT')}</strong>
              <span>{getExpiryLabel(expiry.daysRemaining)}</span>
            </div>
            <span className={getExpiryBadgeClass(expiry.status)}><AlertTriangle className="w-3 h-3" />{expiry.status}</span>
            <div className="expiry-actions">
              <button onClick={() => onEditDocument(document)} aria-label={`Modifica ${document.nome_documento}`}><Pencil className="w-4 h-4" /></button>
              <a href={document.link_drive} target="_blank" rel="noopener noreferrer" aria-label={`Apri ${document.nome_documento}`}><ExternalLink className="w-4 h-4" /></a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
