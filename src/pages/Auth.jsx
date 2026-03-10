import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider.jsx';

function parseLocale(pathname) {
  return pathname.startsWith('/en') ? 'en' : 'lt';
}

function sanitizeNext(rawNext, fallbackPath) {
  const next = String(rawNext || '').trim();
  if (!next) return fallbackPath;
  if (!next.startsWith('/')) return fallbackPath;
  if (next.startsWith('//')) return fallbackPath;
  if (next.includes('\n') || next.includes('\r')) return fallbackPath;

  // Reject absolute URLs like "https://..." even if URLSearchParams returns a decoded value.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(next)) return fallbackPath;

  try {
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return fallbackPath;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallbackPath;
  }
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const locale = useMemo(() => parseLocale(location.pathname), [location.pathname]);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const rawNext = params.get('next');
  const fallbackNext = locale === 'en' ? '/en/account' : '/lt/paskyra';
  const next = useMemo(() => sanitizeNext(rawNext, fallbackNext), [rawNext, fallbackNext]);

  const [mode, setMode] = useState('login'); // login | register | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (user) {
      navigate(next, { replace: true });
    }
  }, [user, navigate, next]);

  const title = locale === 'en' ? 'Account' : 'Paskyra';
  const accountPath = locale === 'en' ? '/en/account' : '/lt/paskyra';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const safeEmail = String(email || '').trim();
    if (!safeEmail) {
      setError(locale === 'en' ? 'Email is required.' : 'El. paštas yra privalomas.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'reset') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(safeEmail, {
          redirectTo: `${window.location.origin}${accountPath}`,
        });
        if (err) throw err;
        setInfo(locale === 'en'
          ? 'Password reset email sent (check your inbox).'
          : 'Slaptažodžio atstatymo laiškas išsiųstas (patikrinkite el. paštą).');
        return;
      }

      if (!password) {
        setError(locale === 'en' ? 'Password is required.' : 'Slaptažodis yra privalomas.');
        return;
      }

      if (mode === 'register') {
        if (password.length < 8) {
          setError(locale === 'en' ? 'Password must be at least 8 characters.' : 'Slaptažodis turi būti bent 8 simbolių.');
          return;
        }
        if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
          setError(locale === 'en' ? 'Password must contain at least one letter and one number.' : 'Slaptažodyje turi būti bent viena raidė ir vienas skaičius.');
          return;
        }
        const { error: err } = await supabase.auth.signUp({
          email: safeEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${accountPath}`,
          },
        });
        if (err) throw err;
        setInfo(locale === 'en'
          ? 'Check your email to confirm your account.'
          : 'Patvirtinkite paskyrą per el. paštą.');
        return;
      }

      const { error: err } = await supabase.auth.signInWithPassword({
        email: safeEmail,
        password,
      });
      if (err) throw err;
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-16 space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-extrabold">{title}</h1>
        <p className="text-black/70">
          {locale === 'en' ? 'Sign in to see your purchases.' : 'Prisijunkite, kad matytumėte savo pirkinius.'}
        </p>
      </div>

      {error ? (
        <div role="alert" className="rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="font-semibold">{locale === 'en' ? 'Error' : 'Klaida'}</div>
          <div className="mt-1 text-sm text-black/70">{error}</div>
        </div>
      ) : null}

      {info ? (
        <div role="status" className="rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="font-semibold">{locale === 'en' ? 'Info' : 'Informacija'}</div>
          <div className="mt-1 text-sm text-black/70">{info}</div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="rounded-2xl border border-black/10 bg-white p-5 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold">{locale === 'en' ? 'Email' : 'El. paštas'}</label>
          <input
            className="w-full rounded-xl border border-black/20 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </div>

        {mode !== 'reset' ? (
          <div className="space-y-1">
            <label className="text-sm font-semibold">{locale === 'en' ? 'Password' : 'Slaptažodis'}</label>
            <input
              className="w-full rounded-xl border border-black/20 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              type="password"
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full glass-green-surface px-4 py-3 font-extrabold text-black transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60"
          aria-busy={busy ? 'true' : 'false'}
        >
          {busy ? (locale === 'en' ? 'Working…' : 'Vykdoma…') : (
            mode === 'register'
              ? (locale === 'en' ? 'Create account' : 'Sukurti paskyrą')
              : mode === 'reset'
                ? (locale === 'en' ? 'Send reset email' : 'Siųsti atstatymo laišką')
                : (locale === 'en' ? 'Sign in' : 'Prisijungti')
          )}
        </button>

        <div className="flex flex-wrap gap-3 text-sm">
          <button type="button" className="underline" onClick={() => { setMode('login'); setError(null); setInfo(null); }}>
            {locale === 'en' ? 'Sign in' : 'Prisijungti'}
          </button>
          <button type="button" className="underline" onClick={() => { setMode('register'); setError(null); setInfo(null); }}>
            {locale === 'en' ? 'Create account' : 'Sukurti paskyrą'}
          </button>
          <button type="button" className="underline" onClick={() => { setMode('reset'); setError(null); setInfo(null); }}>
            {locale === 'en' ? 'Forgot password' : 'Pamiršau slaptažodį'}
          </button>
        </div>
      </form>

      <Link className="text-sm font-semibold underline" to={next}>
        {locale === 'en' ? 'Back' : 'Atgal'}
      </Link>
    </main>
  );
}
