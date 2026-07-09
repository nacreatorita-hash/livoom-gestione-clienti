import { Contact } from '../types';

export interface LivoomShareLeadImport {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  message?: string;
  preferredTime?: string;
  listingTitle?: string;
  listingUrl?: string;
  listingSlug?: string;
  leadId?: string;
  createdAt?: string;
  sourceApp?: string;
}

const IMPORT_PARAM = 'livoomShareLead';

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const toDateOnly = (value?: string) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
};

const buildNotes = (payload: LivoomShareLeadImport) => {
  const parts = [
    payload.message ? `Messaggio: ${payload.message}` : '',
    payload.preferredTime ? `Fascia preferita: ${payload.preferredTime}` : '',
    payload.listingTitle ? `Immobile: ${payload.listingTitle}` : '',
    payload.listingUrl ? `Scheda pubblica: ${payload.listingUrl}` : '',
    payload.leadId ? `ID lead Livoom Share: ${payload.leadId}` : '',
  ].filter(Boolean);

  return parts.join('\n');
};

export const readLivoomShareImportFromUrl = (): LivoomShareLeadImport | null => {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(IMPORT_PARAM);
  if (!encoded) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(encoded));
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.firstName || !parsed.phone) return null;
    return parsed as LivoomShareLeadImport;
  } catch (error) {
    console.error('Invalid Livoom Share import payload:', error);
    return null;
  }
};

export const clearLivoomShareImportFromUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete(IMPORT_PARAM);
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
};

export const mapLivoomShareLeadToContact = (
  payload: LivoomShareLeadImport
): Omit<Contact, 'id' | 'created_at' | 'user_id'> => ({
  nome: payload.firstName.trim(),
  cognome: (payload.lastName || '-').trim() || '-',
  telefono: payload.phone || '',
  email: payload.email || '',
  tipo: 'Lead',
  stato: 'Nuovo',
  note: buildNotes(payload),
  source_type: 'Livoom Share',
  source_url: payload.listingUrl || '',
  source_name: payload.listingTitle || 'Lead immobiliare',
  source_acquired_at: toDateOnly(payload.createdAt),
  source_notes: payload.leadId
    ? `Importato da Livoom Share. Lead originale: ${payload.leadId}`
    : 'Importato da Livoom Share',
});
