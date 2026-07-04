import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shield, Key, Mail, CheckCircle2, AlertCircle, ArrowRight, Sparkles, User, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthViewProps {
  onAuthSuccess: (user: { id: string; email: string; isDemo: boolean }) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const hasSupabase = isSupabaseConfigured();

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onAuthSuccess({
        id: 'demo-user-id',
        email: 'ospite@livoom.it',
        isDemo: true
      });
      setLoading(false);
    }, 800);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabase) {
      // Direct demo login with their custom email if they submit the form without Supabase
      onAuthSuccess({
        id: 'custom-demo-id',
        email: email || 'utente@demo.it',
        isDemo: true
      });
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { data, error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || '',
            isDemo: false
          });
        }
      } else {
        // Sign up
        const { data, error } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        setSuccessMsg('Registrazione completata! Controlla la tua email per confermare l\'account (se richiesto da Supabase) o accedi ora.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Si è verificato un errore durante l\'autenticazione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col justify-between p-4 sm:p-6 md:p-8" id="auth-screen-container">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <div className="z-10 flex items-center justify-between max-w-7xl w-full mx-auto" id="auth-header">
        <div className="flex items-center gap-2.5" id="auth-logo-group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" id="logo-icon">
            <span className="font-sans text-base font-bold">Na</span>
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-lg text-zinc-800" id="logo-text">Livoom Gestione Clienti</h1>
            <p className="text-xs text-zinc-400 font-semibold" id="logo-subtext">Created by Na Creator Italia</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold" id="auth-status-badge">
          {hasSupabase ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Connesso
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Demo Sandbox
            </span>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="z-10 flex-1 flex items-center justify-center py-10" id="auth-card-wrapper">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl"
          id="auth-card"
        >
          <div className="text-center mb-6" id="auth-card-header">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3" id="auth-icon-container">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight text-zinc-800" id="auth-title">
              {isLogin ? 'Accedi al tuo CRM' : 'Crea un nuovo account'}
            </h2>
            <p className="text-xs text-zinc-400 font-semibold mt-1" id="auth-subtitle">
              {isLogin 
                ? 'Gestisci contatti, chiamate e appuntamenti in un unico posto.' 
                : 'Inizia subito a strutturare le tue relazioni commerciali.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-2 font-semibold" id="auth-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-start gap-2 font-semibold" id="auth-success">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4" id="auth-form">
            {!isLogin && (
              <div id="field-fullname">
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Nome Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Esempio: Mario Rossi"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <div id="field-email">
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">Indirizzo Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={hasSupabase ? "mario@rossi.com" : "utente@demo.it"}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <div id="field-password">
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="auth-submit-btn"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Accedi' : 'Registrati'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Sign Up */}
          {hasSupabase && (
            <div className="mt-4 text-center" id="auth-toggle-container">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer"
                id="auth-toggle-btn"
              >
                {isLogin ? 'Non hai un account? Registrati ora' : 'Hai già un account? Accedi'}
              </button>
            </div>
          )}

          {/* Separation Divider */}
          <div className="relative my-6" id="auth-divider">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-150"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold">
              <span className="bg-white px-3 text-zinc-400">Oppure</span>
            </div>
          </div>

          {/* Demo Sandbox Entry */}
          {!hasSupabase && (
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex flex-col gap-3" id="demo-box">
            <div className="flex items-start gap-2.5" id="demo-box-text">
              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-amber-800">Prova Rapida (Senza Database)</h4>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-0.5">
                  Accedi istantaneamente con dati pre-caricati salvati localmente sul tuo browser per testare l'interfaccia.
                </p>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 hover:text-zinc-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-zinc-100"
              id="demo-login-btn"
            >
              Usa Versione Demo <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
          )}
        </motion.div>
      </div>

      {/* Supabase connection guide modal/footer */}
      {!hasSupabase && (
        <div className="z-10 max-w-lg mx-auto bg-white border border-zinc-200/80 rounded-2xl p-4 text-xs text-zinc-500 flex flex-col gap-2 shadow-sm" id="supabase-setup-guide">
          <div className="flex items-center gap-1.5 font-bold text-zinc-700" id="guide-title">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            Come connettere il tuo Database Supabase?
          </div>
          <p className="leading-relaxed font-medium">
            Per salvare i dati nel cloud e abilitare l'autenticazione reale, configura queste variabili nel file <strong>.env.local</strong> oppure nelle Environment Variables di Vercel:
          </p>
          <div className="bg-zinc-50 p-2.5 rounded-lg font-mono text-[10px] text-zinc-600 space-y-1 border border-zinc-200/60" id="guide-code">
            <div>VITE_SUPABASE_URL="https://tuo-id.supabase.co"</div>
            <div>VITE_SUPABASE_ANON_KEY="tua-chiave-anonima"</div>
          </div>
          <p className="text-[10px] text-zinc-400 font-semibold">
            Trovi queste chiavi in Supabase sotto <em>Project Settings → API</em>.
          </p>
        </div>
      )}

      {/* Footer copyright */}
      <div className="z-10 text-center py-4 text-[11px] text-zinc-400 font-medium font-sans" id="auth-footer-credit">
        Livoom Gestione Clienti v1.0.0 &copy; 2026. Created by Na Creator Italia.
      </div>
    </div>
  );
}
