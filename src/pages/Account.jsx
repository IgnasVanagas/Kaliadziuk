import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider.jsx';
import { formatEurFromCents } from '../lib/money';

function parseLocale(pathname) {
  return pathname.startsWith('/en') ? 'en' : 'lt';
}

export default function Account() {
  const location = useLocation();
  const locale = useMemo(() => parseLocale(location.pathname), [location.pathname]);
  const { user, signOut } = useAuth();

  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setBusy(true);
      setError(null);
      try {
        const res = await supabase
          .from('orders')
          .select('id,status,total_cents,currency,created_at,paid_at,order_items(id,name,qty,unit_price_cents,kind,meta)')
          .order('created_at', { ascending: false });

        if (res.error) throw res.error;
        if (!alive) return;
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || String(e));
      } finally {
        if (!alive) return;
        setBusy(false);
      }
    };
    run();
    return () => { alive = false; };
  }, []);

  const title = locale === 'en' ? 'Account' : 'Paskyra';
  const purchasesTitle = locale === 'en' ? 'Your purchases' : 'Jūsų pirkimai';

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-extrabold">{title}</h1>
          <p className="text-black/70">{user?.email || ''}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-full border border-black/20 px-4 py-2 font-semibold"
        >
          {locale === 'en' ? 'Sign out' : 'Atsijungti'}
        </button>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl font-extrabold">{purchasesTitle}</h2>

        {busy ? (
          <p className="text-black/70">{locale === 'en' ? 'Loading…' : 'Kraunama…'}</p>
        ) : null}

        {error ? (
          <div role="alert" className="rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
            <div className="font-semibold">{locale === 'en' ? 'Error' : 'Klaida'}</div>
            <div className="mt-1 text-sm text-black/70">{error}</div>
          </div>
        ) : null}

        {!busy && !error && orders.length === 0 ? (
          <p className="text-black/70">{locale === 'en' ? 'No purchases yet.' : 'Pirkimų dar nėra.'}</p>
        ) : null}

        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-black/10 bg-white p-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold">
                  {locale === 'en' ? 'Order' : 'Užsakymas'} #{String(o.id).slice(0, 8)}
                </div>
                <div className="text-sm text-black/70">
                  {formatEurFromCents(Number(o.total_cents || 0))}
                </div>
              </div>

              <div className="text-xs text-black/60">
                {locale === 'en' ? 'Status' : 'Būsena'}: {String(o.status || '')}
                {o.paid_at ? ` • ${locale === 'en' ? 'Paid' : 'Apmokėta'}: ${new Date(o.paid_at).toLocaleString()}` : ''}
              </div>

              {Array.isArray(o.order_items) && o.order_items.length ? (
                <ul className="mt-2 space-y-1">
                  {o.order_items.map((it) => (
                    <li key={it.id} className="text-sm text-black/80 flex justify-between gap-3">
                      <span>{it.name} ×{Number(it.qty || 1)}</span>
                      <span className="text-black/60">{formatEurFromCents(Number(it.unit_price_cents || 0) * Number(it.qty || 1))}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
