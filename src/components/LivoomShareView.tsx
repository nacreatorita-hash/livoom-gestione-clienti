import React from 'react';
import { ExternalLink, Share2, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const livoomShareUrl = ((import.meta as any).env?.VITE_LIVOOM_SHARE_URL || '').trim();

export default function LivoomShareView() {
  const configuredUrl = livoomShareUrl || 'https://livoom-share.vercel.app';

  return (
    <div className="space-y-6" id="livoom-share-view">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500 mb-2">Integrazione</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">Livoom Share</h1>
          <p className="text-xs text-zinc-400 font-semibold mt-1 max-w-2xl">
            Crea pagine immobiliari condivisibili e porta i lead raccolti direttamente dentro questo gestionale clienti.
          </p>
        </div>

        <a
          href={configuredUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors"
          id="open-livoom-share-btn"
        >
          <Share2 className="w-4 h-4" />
          Apri Livoom Share
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900">Flusso clienti collegato</h2>
              <p className="text-xs text-zinc-400 font-semibold">Dal lead immobiliare al CRM, senza ricopiare dati a mano.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              'Importa immobili e pubblica pagine condivisibili da Livoom Share.',
              'Quando un visitatore lascia nome e telefono, il lead resta tracciato in Livoom Share.',
              'Dal dettaglio lead premi “Aggiungi su Gestionale Clienti” per creare il contatto in questo CRM.',
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="w-6 h-6 rounded-lg bg-white border border-zinc-200 text-[10px] font-black text-indigo-600 flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="text-xs text-zinc-600 font-semibold leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-300 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold">Import protetto</h3>
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed mt-2">
            Il salvataggio del cliente avviene qui, dentro la sessione Supabase del gestionale, rispettando le regole utenti già esistenti.
          </p>
          <a
            href={configuredUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-emerald-300 hover:text-emerald-200"
          >
            Vai alla nuova app <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
