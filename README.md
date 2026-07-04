# Livoom Gestione Clienti

Created by Na Creator Italia

Mini CRM per gestire contatti, chiamate, richiami, appuntamenti e collegamenti a documenti Google Drive.

## Requisiti

- Node.js 20 o successivo
- npm
- Un progetto Supabase per la modalità online

## Avvio locale

Installa le dipendenze:

```bash
npm install
```

Copia `.env.example` in `.env.local` e inserisci i valori pubblici del progetto Supabase:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Avvia l'applicazione:

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`.

Se le variabili Supabase non sono configurate, l'applicazione usa la modalità demo locale basata su `localStorage`.

## Supabase

Lo schema ufficiale e versionato è:

```text
supabase/migrations/202607040001_initial_crm_schema.sql
```

La migrazione comprende:

- tabelle `contacts`, `calls`, `appointments` e `documents`;
- chiavi esterne con eliminazione a cascata;
- vincoli che impediscono collegamenti tra record di utenti differenti;
- indici per utente, contatto e data;
- colonne `created_at` e `updated_at`;
- trigger automatici per `updated_at`;
- Row Level Security;
- policy separate per lettura, inserimento, modifica ed eliminazione;
- accesso ai dati riservato al ruolo `authenticated`.

### Applicazione tramite SQL Editor

1. Crea un nuovo progetto Supabase.
2. Apri **SQL Editor**.
3. Copia il contenuto della migrazione ed eseguilo una sola volta.
4. In **Project Settings → API** recupera Project URL e chiave `anon`/`publishable`.
5. Inserisci i valori in `.env.local` per lo sviluppo e nelle variabili ambiente di Vercel per il deploy.

In alternativa, con Supabase CLI collegata al progetto:

```bash
supabase link --project-ref ID_PROGETTO
supabase db push
```

La chiave `anon`/`publishable` può essere usata nel frontend perché l'accesso è protetto dalle policy RLS. Non inserire mai una chiave `service_role` nel codice, nei file Git o nelle variabili `VITE_*`.

## Controlli prima del deploy

```bash
npm install
npm run lint
npm run build
```

La build viene generata nella cartella `dist`.

## GitHub

La cartella non contiene ancora un repository Git. Per pubblicarla in un nuovo repository vuoto:

```bash
git init
git add .
git status
git commit -m "Initial release: Livoom Gestione Clienti"
git branch -M main
git remote add origin https://github.com/USERNAME/NOME-REPOSITORY.git
git push -u origin main
```

Prima del commit verifica con `git status` che non compaiano `.env`, `.env.local`, `node_modules`, `dist` o `.vercel`.

## Deploy su Vercel

1. Pubblica il repository su GitHub.
2. In Vercel scegli **Add New Project** e importa il repository.
3. Vercel rileverà automaticamente Vite.
4. Controlla le impostazioni:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. In **Project Settings → Environment Variables** aggiungi:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Applica le variabili a Production, Preview e Development secondo necessità.
7. Avvia il deploy.

Non è necessario un file `vercel.json`: questa applicazione è attualmente una Single Page Application Vite senza routing basato su URL e usa la configurazione automatica di Vercel.

## Sicurezza dei file

Il `.gitignore` esclude dipendenze, build, file ambiente, file locali e configurazione Vercel. `.env.example` contiene esclusivamente nomi di variabili e valori vuoti e deve rimanere versionato.

