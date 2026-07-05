import { createClient } from '@supabase/supabase-js';
import { Contact, Call, Appointment, DocumentDrive, CRMStats } from '../types';

// Retrieve Supabase credentials from environment
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Determine if Supabase is actually configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '';
};

// Create the Supabase client if configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial high-fidelity seed data for Demo Mode
const SEED_CONTACTS: Contact[] = [
  {
    id: 'c1',
    created_at: '2026-06-15T09:00:00Z',
    user_id: 'demo-user-id',
    nome: 'Alessandro',
    cognome: 'Moretti',
    telefono: '+39 345 6789012',
    email: 'alessandro.moretti@email.it',
    tipo: 'Prospect',
    stato: 'In Contatto',
    note: 'Interessato al software aziendale. Richiede demo personalizzata.',
    source_type: 'Facebook',
    source_url: 'https://www.facebook.com/profile.php?id=alessandromoretti',
    source_name: 'Gruppo Erasmus Napoli',
    source_acquired_at: '2026-06-15',
    source_notes: 'Trovato su gruppo Facebook, cerca stanza singola',
  },
  {
    id: 'c2',
    created_at: '2026-06-20T11:30:00Z',
    user_id: 'demo-user-id',
    nome: 'Giulia',
    cognome: 'Bianchi',
    telefono: '+39 333 1122334',
    email: 'giulia.bianchi@designstudio.com',
    tipo: 'Cliente',
    stato: 'Chiuso Vinto',
    note: 'Contratto di consulenza firmato. Ottimo cliente.',
    source_type: 'Instagram',
    source_url: 'https://www.instagram.com/giulia.design',
    source_name: 'Giulia Design Studio',
    source_acquired_at: '2026-06-20',
    source_notes: 'Contattata tramite DM su Instagram dal profilo aziendale',
  },
  {
    id: 'c3',
    created_at: '2026-07-01T14:20:00Z',
    user_id: 'demo-user-id',
    nome: 'Marco',
    cognome: 'Rossi',
    telefono: '+39 320 9876543',
    email: 'm.rossi@techcorp.it',
    tipo: 'Lead',
    stato: 'Nuovo',
    note: 'Contattato tramite form sul sito. Richiede preventivo entro lunedì.',
    source_type: 'Marketplace',
    source_url: 'https://www.facebook.com/marketplace/item/1029384756',
    source_name: 'Marketplace Facebook',
    source_acquired_at: '2026-07-01',
    source_notes: 'Trovato annuncio per affitto bilocale su Marketplace',
  },
  {
    id: 'c4',
    created_at: '2026-06-10T10:00:00Z',
    user_id: 'demo-user-id',
    nome: 'Sofia',
    cognome: 'Ferrari',
    telefono: '+39 347 5556677',
    email: 'sofia.ferrari@consulting.org',
    tipo: 'Partner',
    stato: 'Trattativa',
    note: 'Discussione per accordo di rivendita licenze CRM.',
    source_type: 'Passaparola',
    source_url: '',
    source_name: '',
    source_acquired_at: '2026-06-10',
    source_notes: 'Referral da parte del partner storico',
  }
];

const SEED_CALLS: Call[] = [
  {
    id: 'call1',
    created_at: '2026-07-02T10:00:00Z',
    user_id: 'demo-user-id',
    contatto_id: 'c1',
    data_chiamata: '2026-07-02T10:15:00Z',
    esito: 'Risposto',
    nota: 'Prima telefonata conoscitiva. Ha espresso interesse per modulo marketing.',
    prossimo_richiamo: '2026-07-03', // Richiamo oggi!
  },
  {
    id: 'call2',
    created_at: '2026-07-03T09:30:00Z',
    user_id: 'demo-user-id',
    contatto_id: 'c3',
    data_chiamata: '2026-07-03T09:30:00Z',
    esito: 'Non risposto',
    nota: 'Tentativo di contatto telefonico. Segreteria telefonica. Riprovare nel pomeriggio.',
    prossimo_richiamo: '2026-07-03', // Richiamo oggi!
  }
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'app1',
    created_at: '2026-06-28T16:00:00Z',
    user_id: 'demo-user-id',
    titolo: 'Demo Prodotto Livoom Gestione Clienti',
    contatto_id: 'c1',
    data: '2026-07-03', // Oggi!
    ora: '11:00',
    tipo: 'Video Call',
    note: 'Presentare modulo contatti, chiamate e gestione documenti Google Drive.',
  },
  {
    id: 'app2',
    created_at: '2026-07-01T10:00:00Z',
    user_id: 'demo-user-id',
    titolo: 'Firma Contratto Integrativo',
    contatto_id: 'c2',
    data: '2026-07-03', // Oggi!
    ora: '15:30',
    tipo: 'Presenziale',
    note: 'Incontro presso la loro sede a Milano per firma copie fisiche.',
  }
];

const SEED_DOCUMENTS: DocumentDrive[] = [
  {
    id: 'doc1',
    created_at: '2026-06-21T10:00:00Z',
    user_id: 'demo-user-id',
    contatto_id: 'c2',
    nome_documento: 'Contratto Consulenza Firmato',
    link_drive: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view',
    tipo_documento: 'Contratto',
    scadenza: '2027-06-20',
  },
  {
    id: 'doc2',
    created_at: '2026-07-01T15:00:00Z',
    user_id: 'demo-user-id',
    contatto_id: 'c4',
    nome_documento: 'Bozza Accordo di Partnership v2',
    link_drive: 'https://docs.google.com/document/d/1XyZ_DraftAgreement/edit',
    tipo_documento: 'Preventivo',
    scadenza: null,
  }
];

// Helper to initialize localStorage with seeds if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem('nacrm_contacts')) {
    localStorage.setItem('nacrm_contacts', JSON.stringify(SEED_CONTACTS));
  }
  if (!localStorage.getItem('nacrm_calls')) {
    localStorage.setItem('nacrm_calls', JSON.stringify(SEED_CALLS));
  }
  if (!localStorage.getItem('nacrm_appointments')) {
    localStorage.setItem('nacrm_appointments', JSON.stringify(SEED_APPOINTMENTS));
  }
  if (!localStorage.getItem('nacrm_documents')) {
    localStorage.setItem('nacrm_documents', JSON.stringify(SEED_DOCUMENTS));
  }
};

initializeLocalStorage();

// Standard storage engine wrapper that switches seamlessly between Supabase and LocalStorage
export const storage = {
  // --- CONTACTS ---
  getContacts: async (userId: string): Promise<Contact[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_contacts') || '[]');
      return list.filter((c: any) => c.user_id === userId);
    }
  },

  createContact: async (contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_contacts') || '[]');
      const newContact: Contact = {
        ...contact,
        id: 'c_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      list.push(newContact);
      localStorage.setItem('nacrm_contacts', JSON.stringify(list));
      return newContact;
    }
  },

  updateContact: async (id: string, updates: Partial<Omit<Contact, 'id' | 'created_at' | 'user_id'>>): Promise<Contact> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_contacts') || '[]');
      const index = list.findIndex((c: any) => c.id === id);
      if (index === -1) throw new Error('Contatto non trovato');
      const updated = { ...list[index], ...updates };
      list[index] = updated;
      localStorage.setItem('nacrm_contacts', JSON.stringify(list));
      return updated;
    }
  },

  deleteContact: async (id: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    } else {
      // Delete contact
      let list = JSON.parse(localStorage.getItem('nacrm_contacts') || '[]');
      list = list.filter((c: any) => c.id !== id);
      localStorage.setItem('nacrm_contacts', JSON.stringify(list));

      // Cascade delete related calls, appointments, and docs
      let calls = JSON.parse(localStorage.getItem('nacrm_calls') || '[]');
      calls = calls.filter((item: any) => item.contatto_id !== id);
      localStorage.setItem('nacrm_calls', JSON.stringify(calls));

      let appts = JSON.parse(localStorage.getItem('nacrm_appointments') || '[]');
      appts = appts.filter((item: any) => item.contatto_id !== id);
      localStorage.setItem('nacrm_appointments', JSON.stringify(appts));

      let docs = JSON.parse(localStorage.getItem('nacrm_documents') || '[]');
      docs = docs.filter((item: any) => item.contatto_id !== id);
      localStorage.setItem('nacrm_documents', JSON.stringify(docs));
    }
  },

  // --- CALLS ---
  getCalls: async (userId: string): Promise<Call[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('data_chiamata', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_calls') || '[]');
      const sorted = list.filter((c: any) => c.user_id === userId);
      return sorted.sort((a: any, b: any) => new Date(b.data_chiamata).getTime() - new Date(a.data_chiamata).getTime());
    }
  },

  createCall: async (call: Omit<Call, 'id' | 'created_at'>): Promise<Call> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('calls')
        .insert([call])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_calls') || '[]');
      const newCall: Call = {
        ...call,
        id: 'call_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      list.push(newCall);
      localStorage.setItem('nacrm_calls', JSON.stringify(list));
      return newCall;
    }
  },

  // --- APPOINTMENTS ---
  getAppointments: async (userId: string): Promise<Appointment[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('data', { ascending: true })
        .order('ora', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_appointments') || '[]');
      const filtered = list.filter((c: any) => c.user_id === userId);
      return filtered.sort((a: any, b: any) => {
        const dateCompare = a.data.localeCompare(b.data);
        if (dateCompare !== 0) return dateCompare;
        return a.ora.localeCompare(b.ora);
      });
    }
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_appointments') || '[]');
      const newAppt: Appointment = {
        ...appointment,
        id: 'appt_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      list.push(newAppt);
      localStorage.setItem('nacrm_appointments', JSON.stringify(list));
      return newAppt;
    }
  },

  deleteAppointment: async (id: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
    } else {
      let list = JSON.parse(localStorage.getItem('nacrm_appointments') || '[]');
      list = list.filter((a: any) => a.id !== id);
      localStorage.setItem('nacrm_appointments', JSON.stringify(list));
    }
  },

  // --- DOCUMENTS ---
  getDocuments: async (userId: string): Promise<DocumentDrive[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_documents') || '[]');
      const filtered = list.filter((c: any) => c.user_id === userId);
      return filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  createDocument: async (doc: Omit<DocumentDrive, 'id' | 'created_at'>): Promise<DocumentDrive> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('documents')
        .insert([doc])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_documents') || '[]');
      const newDoc: DocumentDrive = {
        ...doc,
        id: 'doc_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      list.push(newDoc);
      localStorage.setItem('nacrm_documents', JSON.stringify(list));
      return newDoc;
    }
  },

  updateDocument: async (id: string, updates: Partial<Omit<DocumentDrive, 'id' | 'created_at' | 'user_id'>>): Promise<DocumentDrive> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = JSON.parse(localStorage.getItem('nacrm_documents') || '[]');
      const index = list.findIndex((d: DocumentDrive) => d.id === id);
      if (index === -1) throw new Error('Documento non trovato');
      list[index] = { ...list[index], ...updates };
      localStorage.setItem('nacrm_documents', JSON.stringify(list));
      return list[index];
    }
  },

  deleteDocument: async (id: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    } else {
      let list = JSON.parse(localStorage.getItem('nacrm_documents') || '[]');
      list = list.filter((d: any) => d.id !== id);
      localStorage.setItem('nacrm_documents', JSON.stringify(list));
    }
  }
};
