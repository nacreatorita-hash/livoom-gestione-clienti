export type ContactType = 'Lead' | 'Cliente' | 'Partner' | 'Prospect';
export type ContactStatus = 'Nuovo' | 'In Contatto' | 'Trattativa' | 'Chiuso Vinto' | 'Chiuso Perso';
export type CallOutcome = 'Risposto' | 'Non risposto' | 'Da richiamare' | 'Non interessato' | 'Appuntamento fissato';
export type AppointmentType = 'Telefonico' | 'Video Call' | 'Presenziale' | 'Altro';
export type DocumentType = 'Contratto' | 'Preventivo' | 'Fattura' | 'Identità' | 'Altro';
export type ViewType = 'dashboard' | 'contatti' | 'chiamate' | 'agenda' | 'documenti' | 'scadenze-documenti';

export interface Contact {
  id: string;
  created_at: string;
  user_id: string;
  nome: string;
  cognome: string;
  telefono: string;
  email: string;
  tipo: ContactType;
  stato: ContactStatus;
  note: string;
  source_type?: string;
  source_url?: string;
  source_name?: string;
  source_acquired_at?: string;
  source_notes?: string;
}

export interface Call {
  id: string;
  created_at: string;
  user_id: string;
  contatto_id: string;
  data_chiamata: string;
  esito: CallOutcome;
  nota: string;
  prossimo_richiamo: string | null; // Data del richiamo
}

export interface Appointment {
  id: string;
  created_at: string;
  user_id: string;
  titolo: string;
  contatto_id: string;
  data: string; // YYYY-MM-DD
  ora: string;  // HH:MM
  tipo: AppointmentType;
  note: string;
}

export interface DocumentDrive {
  id: string;
  created_at: string;
  user_id: string;
  contatto_id: string;
  nome_documento: string;
  link_drive: string;
  tipo_documento: DocumentType;
  scadenza: string | null; // YYYY-MM-DD
  nota_scadenza?: string | null;
}

// Stats interface for the Dashboard
export interface CRMStats {
  totalContacts: number;
  newContacts: number;
  inContactContacts: number;
  wonContacts: number;
  lostContacts: number;
  callsMade: number;
  appointmentsCount: number;
  documentsCount: number;
}
