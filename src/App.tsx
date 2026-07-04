import React, { useState, useEffect } from 'react';
import { supabase, storage, isSupabaseConfigured } from './lib/supabase';
import { Contact, Call, Appointment, DocumentDrive, ViewType } from './types';

// Import Views
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ContattiView from './components/ContattiView';
import ChiamateView from './components/ChiamateView';
import AgendaView from './components/AgendaView';
import DocumentiView from './components/DocumentiView';

import { AlertCircle, Loader2, Sparkles, Database, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Authentication & Session
  const [user, setUser] = useState<{ id: string; email: string; isDemo: boolean } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Layout Navigation
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Core CRM Data Stores
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<DocumentDrive[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Context passing between views
  const [preselectedContact, setPreselectedContact] = useState<Contact | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Global Toast Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Check for active Supabase Auth session on first load
  useEffect(() => {
    const checkActiveSession = async () => {
      setAuthLoading(true);
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              isDemo: false
            });
            
          }
        } catch (err) {
          console.error('Session check error:', err);
        }
      } else {
        // Supabase not configured, check if local guest is logged in
        const cachedGuest = localStorage.getItem('nacrm_guest_user');
        if (cachedGuest) {
          setUser(JSON.parse(cachedGuest));
        }
      }
      setAuthLoading(false);
    };

    checkActiveSession();

    // Subscribe to auth state updates if configured
    let authSubscription: any = null;
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            isDemo: false
          });
        } else {
          // If we logged out of Supabase
          setUser(prev => prev && !prev.isDemo ? null : prev);
        }
      });
      authSubscription = subscription;
    }

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  // Hydrate data once the user logs in
  useEffect(() => {
    if (user) {
      fetchCRMData();
    } else {
      setContacts([]);
      setCalls([]);
      setAppointments([]);
      setDocuments([]);
    }
  }, [user]);

  // Helper helper to show user feedback toasts
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Main fetch call to storage database
  const fetchCRMData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [fetchedContacts, fetchedCalls, fetchedAppointments, fetchedDocuments] = await Promise.all([
        storage.getContacts(user.id),
        storage.getCalls(user.id),
        storage.getAppointments(user.id),
        storage.getDocuments(user.id)
      ]);

      setContacts(fetchedContacts);
      setCalls(fetchedCalls);
      setAppointments(fetchedAppointments);
      setDocuments(fetchedDocuments);
    } catch (err: any) {
      console.error('Failed to load CRM data:', err);
      showNotification('Errore nel recupero dei dati: ' + (err.message || 'Verifica la connessione'), 'error');
    } finally {
      setDataLoading(false);
    }
  };

  // --- ACTIONS ---

  // Contacts
  const handleCreateContact = async (contactPayload: Omit<Contact, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) throw new Error('Non autenticato');
    try {
      const newContact = await storage.createContact({
        ...contactPayload,
        user_id: user.id
      });
      setContacts(prev => [newContact, ...prev].sort((a, b) => a.nome.localeCompare(b.nome)));
      showNotification(`Contatto "${newContact.nome} ${newContact.cognome}" creato con successo.`, 'success');
      return newContact;
    } catch (err: any) {
      showNotification('Errore durante la creazione del contatto: ' + err.message, 'error');
      throw err;
    }
  };

  const handleUpdateContact = async (id: string, updates: Partial<Omit<Contact, 'id' | 'created_at' | 'user_id'>>) => {
    try {
      const updated = await storage.updateContact(id, updates);
      setContacts(prev => prev.map(c => c.id === id ? updated : c).sort((a, b) => a.nome.localeCompare(b.nome)));
      showNotification(`Anagrafica di ${updated.nome} aggiornata.`, 'success');
      return updated;
    } catch (err: any) {
      showNotification('Errore durante l\'aggiornamento del contatto: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await storage.deleteContact(id);
      // Remove contact locally
      setContacts(prev => prev.filter(c => c.id !== id));
      // Cascade remove child items locally
      setCalls(prev => prev.filter(c => c.contatto_id !== id));
      setAppointments(prev => prev.filter(a => a.contatto_id !== id));
      setDocuments(prev => prev.filter(d => d.contatto_id !== id));
      showNotification('Contatto eliminato e record ad esso associati cancellati correttamente.', 'success');
    } catch (err: any) {
      showNotification('Impossibile eliminare il contatto: ' + err.message, 'error');
      throw err;
    }
  };

  // Calls
  const handleCreateCall = async (callPayload: Omit<Call, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) throw new Error('Non autenticato');
    try {
      const newCall = await storage.createCall({
        ...callPayload,
        user_id: user.id
      });
      setCalls(prev => [newCall, ...prev]);
      
      // Automatic contact state update for better CRM experience!
      // If we scheduled a callback or logged a response, let's update contact status to "In Contatto"
      const currentContactObj = contacts.find(c => c.id === callPayload.contatto_id);
      if (currentContactObj && currentContactObj.stato === 'Nuovo') {
        await handleUpdateContact(currentContactObj.id, { stato: 'In Contatto' });
      }

      showNotification('Chiamata salvata nel registro commerciale.', 'success');
      return newCall;
    } catch (err: any) {
      showNotification('Errore nel salvataggio della chiamata: ' + err.message, 'error');
      throw err;
    }
  };

  // Appointments
  const handleCreateAppointment = async (apptPayload: Omit<Appointment, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) throw new Error('Non autenticato');
    try {
      const newAppt = await storage.createAppointment({
        ...apptPayload,
        user_id: user.id
      });
      setAppointments(prev => {
        const sorted = [...prev, newAppt];
        return sorted.sort((a, b) => {
          const dateCompare = a.data.localeCompare(b.data);
          if (dateCompare !== 0) return dateCompare;
          return a.ora.localeCompare(b.ora);
        });
      });

      // Update contact state to "Trattativa" when an appointment is secured!
      const currentContactObj = contacts.find(c => c.id === apptPayload.contatto_id);
      if (currentContactObj && (currentContactObj.stato === 'Nuovo' || currentContactObj.stato === 'In Contatto')) {
        await handleUpdateContact(currentContactObj.id, { stato: 'Trattativa' });
      }

      showNotification(`Appuntamento "${newAppt.titolo}" inserito correttamente in agenda.`, 'success');
      return newAppt;
    } catch (err: any) {
      showNotification('Impossibile inserire l\'appuntamento: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await storage.deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      showNotification('Appuntamento rimosso correttamente dall\'agenda.', 'success');
    } catch (err: any) {
      showNotification('Impossibile eliminare l\'appuntamento: ' + err.message, 'error');
      throw err;
    }
  };

  // Documents
  const handleCreateDocument = async (docPayload: Omit<DocumentDrive, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) throw new Error('Non autenticato');
    try {
      const newDoc = await storage.createDocument({
        ...docPayload,
        user_id: user.id
      });
      setDocuments(prev => [newDoc, ...prev]);
      showNotification(`Link a "${newDoc.nome_documento}" collegato con successo al contatto.`, 'success');
      return newDoc;
    } catch (err: any) {
      showNotification('Impossibile salvare il collegamento al file: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await storage.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      showNotification('Documento scollegato con successo.', 'success');
    } catch (err: any) {
      showNotification('Impossibile scollegare il file: ' + err.message, 'error');
      throw err;
    }
  };

  // --- NAVIGATION SHORTCUT HELPERS ---
  const handleAddCallForContact = (contact: Contact) => {
    setPreselectedContact(contact);
    setCurrentView('chiamate');
  };

  const handleAddAppointmentForContact = (contact: Contact) => {
    setPreselectedContact(contact);
    setCurrentView('agenda');
  };

  const handleAddDocumentForContact = (contact: Contact) => {
    setPreselectedContact(contact);
    setCurrentView('documenti');
  };

  const handleSelectAndGoToContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setCurrentView('contatti');
  };

  // Handle successful login
  const handleAuthSuccess = (loggedUser: { id: string; email: string; isDemo: boolean }) => {
    setUser(loggedUser);
    if (loggedUser.isDemo) {
      localStorage.setItem('nacrm_guest_user', JSON.stringify(loggedUser));
    }
    showNotification(`Accesso effettuato come ${loggedUser.email}`, 'success');
  };

  // Logout routine
  const handleLogout = async () => {
    if (user && !user.isDemo && isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('nacrm_guest_user');
    setUser(null);
    setCurrentView('dashboard');
    showNotification('Sessione disconnessa con successo.', 'info');
  };

  // Map view IDs to clean labels for Header
  const getViewLabel = () => {
    switch (currentView) {
      case 'dashboard': return 'CRUSCOTTO DIREZIONALE';
      case 'contatti': return 'ANAGRAFICA CONTATTI';
      case 'chiamate': return 'REGISTRO TELEFONATE';
      case 'agenda': return 'AGENDA APPUNTAMENTI';
      case 'documenti': return 'COLLEGAMENTI GOOGLE DRIVE';
      default: return 'Livoom Gestione Clienti';
    }
  };

  // Render Loader screen for app initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-500 p-6" id="auth-loader-screen">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-zinc-700">Inizializzazione Livoom Gestione Clienti...</p>
        <p className="text-xs text-zinc-400 mt-1 font-medium">Caricamento moduli e sessioni...</p>
      </div>
    );
  }

  // Not logged in -> Show Auth View
  if (!user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex font-sans antialiased" id="crm-main-layout">
      
      {/* Sidebar navigation */}
      <Sidebar 
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
          setPreselectedContact(null); // clear context if they clicked sidebar
        }}
        user={user}
        onLogout={handleLogout}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64" id="crm-content-frame">
        
        {/* Top Header */}
        <Header 
          currentViewLabel={getViewLabel()}
          user={user}
          setIsOpenMobile={setIsOpenMobile}
          onLogout={handleLogout}
        />

        {/* Global Floating Toast Alert */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-xl flex items-start gap-3 max-w-sm backdrop-blur-md ${
                notification.type === 'success' 
                  ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-400' 
                  : notification.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500/20 text-rose-400'
                  : 'bg-indigo-950/80 border-indigo-500/20 text-indigo-400'
              }`}
              id="global-notification"
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-semibold leading-relaxed">
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Content Canvas */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto" id="crm-main-canvas">
          
          {dataLoading && (
            <div className="py-2 flex items-center justify-center gap-2 text-xs text-amber-500/70 mb-4 bg-amber-500/5 border border-amber-500/10 rounded-xl" id="sync-loader">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sincronizzazione in corso con il database...</span>
            </div>
          )}

          {/* Subview router */}
          <div className="h-full" id="router-container">
            {currentView === 'dashboard' && (
              <DashboardView 
                contacts={contacts}
                calls={calls}
                appointments={appointments}
                documents={documents}
                onNavigateToView={(view) => {
                  setCurrentView(view);
                  setPreselectedContact(null);
                }}
                onSelectContact={handleSelectAndGoToContact}
                onAddCallForContact={handleAddCallForContact}
              />
            )}

            {currentView === 'contatti' && (
              <ContattiView 
                contacts={contacts}
                calls={calls}
                appointments={appointments}
                documents={documents}
                onCreateContact={handleCreateContact}
                onUpdateContact={handleUpdateContact}
                onDeleteContact={handleDeleteContact}
                onAddCall={handleAddCallForContact}
                onAddAppointment={handleAddAppointmentForContact}
                onAddDocument={handleAddDocumentForContact}
                selectedContactId={selectedContactId}
                setSelectedContactId={setSelectedContactId}
              />
            )}

            {currentView === 'chiamate' && (
              <ChiamateView 
                contacts={contacts}
                calls={calls}
                onCreateCall={handleCreateCall}
                onSelectContact={setSelectedContactId}
                onNavigateToView={(view) => {
                  setCurrentView(view);
                }}
                preselectedContact={preselectedContact}
                clearPreselectedContact={() => setPreselectedContact(null)}
              />
            )}

            {currentView === 'agenda' && (
              <AgendaView 
                contacts={contacts}
                appointments={appointments}
                onCreateAppointment={handleCreateAppointment}
                onDeleteAppointment={handleDeleteAppointment}
                onSelectContact={setSelectedContactId}
                onNavigateToView={(view) => {
                  setCurrentView(view);
                }}
                preselectedContact={preselectedContact}
                clearPreselectedContact={() => setPreselectedContact(null)}
              />
            )}

            {currentView === 'documenti' && (
              <DocumentiView 
                contacts={contacts}
                documents={documents}
                onCreateDocument={handleCreateDocument}
                onDeleteDocument={handleDeleteDocument}
                onSelectContact={setSelectedContactId}
                onNavigateToView={(view) => {
                  setCurrentView(view);
                }}
                preselectedContact={preselectedContact}
                clearPreselectedContact={() => setPreselectedContact(null)}
              />
            )}
          </div>

        </main>
      </div>

    </div>
  );
}
