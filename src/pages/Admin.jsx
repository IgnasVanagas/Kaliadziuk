import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { formatEurFromCents } from '../lib/money';

function functionUrl(name) {
  const base = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${name}`;
}

export default function Admin() {
  const location = useLocation();
  const navigate = useNavigate();

  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  useEffect(() => {
    if (locale === 'en') navigate('/lt/admin', { replace: true });
  }, [locale, navigate]);

  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('orders');

  const [orders, setOrders] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const [selectedGiftCardId, setSelectedGiftCardId] = useState(null);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [giftEditStatus, setGiftEditStatus] = useState('active');
  const [giftEditExpiresAt, setGiftEditExpiresAt] = useState('');
  const [giftEditRecipientName, setGiftEditRecipientName] = useState('');
  const [giftEditRecipientEmail, setGiftEditRecipientEmail] = useState('');
  const [giftEditBuyerName, setGiftEditBuyerName] = useState('');
  const [giftEditBuyerEmail, setGiftEditBuyerEmail] = useState('');
  const [giftAdjustEur, setGiftAdjustEur] = useState('');

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editFulfillment, setEditFulfillment] = useState('needs_contact');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  const checkAdmin = async () => {
    setErr(null);
    setIsAdmin(null);
    if (!session) return;
    const res = await supabase.rpc('is_admin');
    if (res.error) {
      setErr(res.error.message);
      setIsAdmin(null);
      return;
    }
    setIsAdmin(Boolean(res.data));
  };

  useEffect(() => {
    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadData = async () => {
    setErr(null);
    const o = await supabase
      .from('orders')
      .select('id,status,fulfillment_status,total_cents,currency,paid_at,created_at,customers(email,phone,full_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (o.error) setErr(o.error.message);
    setOrders(o.data || []);

    const g = await supabase
      .from('gift_cards')
      .select('id,remaining_amount_cents,initial_amount_cents,status,expires_at,recipient_name,recipient_email,buyer_name,buyer_email,purchased_order_id,created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (g.error) setErr(g.error.message);
    setGiftCards(g.data || []);
  };

  const loadGiftCardDetail = async (giftCardId) => {
    setErr(null);
    setSelectedGiftCardId(giftCardId);
    setSelectedGiftCard(null);

    const res = await supabase
      .from('gift_cards')
      .select('id,remaining_amount_cents,initial_amount_cents,status,expires_at,recipient_name,recipient_email,buyer_name,buyer_email,purchased_order_id,created_at')
      .eq('id', giftCardId)
      .single();

    if (res.error) {
      setErr(res.error.message);
      return;
    }

    setSelectedGiftCard(res.data);
    setGiftEditStatus(res.data.status || 'active');
    setGiftEditExpiresAt(res.data.expires_at ? String(res.data.expires_at).slice(0, 16) : '');
    setGiftEditRecipientName(res.data.recipient_name || '');
    setGiftEditRecipientEmail(res.data.recipient_email || '');
    setGiftEditBuyerName(res.data.buyer_name || '');
    setGiftEditBuyerEmail(res.data.buyer_email || '');
    setGiftAdjustEur('');
  };

  const saveGiftCardUpdates = async () => {
    if (!selectedGiftCardId) return;
    setErr(null);
    setBusy(true);
    try {
      const expiresAtIso = giftEditExpiresAt ? new Date(giftEditExpiresAt).toISOString() : null;

      const up = await supabase
        .from('gift_cards')
        .update({
          status: giftEditStatus,
          expires_at: expiresAtIso || (selectedGiftCard?.expires_at ?? null),
          recipient_name: giftEditRecipientName || null,
          recipient_email: giftEditRecipientEmail || null,
          buyer_name: giftEditBuyerName || null,
          buyer_email: giftEditBuyerEmail || null,
        })
        .eq('id', selectedGiftCardId)
        .select('id,remaining_amount_cents,initial_amount_cents,status,expires_at,recipient_name,recipient_email,buyer_name,buyer_email,purchased_order_id,created_at')
        .single();
      if (up.error) throw new Error(up.error.message);

      // Optional balance adjustment (ledger-backed)
      const adj = String(giftAdjustEur || '').trim();
      if (adj) {
        const eur = Number(adj.replace(',', '.'));
        const deltaCents = Math.round(eur * 100);
        if (!Number.isFinite(deltaCents) || deltaCents === 0) {
          throw new Error('Neteisinga korekcija (EUR)');
        }
        const rpc = await supabase.rpc('admin_adjust_gift_card_balance', {
          p_gift_card_id: selectedGiftCardId,
          p_delta_cents: deltaCents,
        });
        if (rpc.error) throw new Error(rpc.error.message);

        const refreshed = await supabase
          .from('gift_cards')
          .select('id,remaining_amount_cents,initial_amount_cents,status,expires_at,recipient_name,recipient_email,buyer_name,buyer_email,purchased_order_id,created_at')
          .eq('id', selectedGiftCardId)
          .single();
        if (refreshed.error) throw new Error(refreshed.error.message);
        setSelectedGiftCard(refreshed.data);
        setGiftEditStatus(refreshed.data.status || giftEditStatus);
      } else {
        setSelectedGiftCard(up.data);
      }

      setGiftAdjustEur('');
      await loadData();
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const deleteGiftCard = async (giftCardId) => {
    const ok = window.confirm('Ištrinti dovanų kuponą? (negrįžtama)');
    if (!ok) return;

    setErr(null);
    setBusy(true);
    try {
      const url = functionUrl('admin-delete-gift-card');
      if (!url) throw new Error('Missing VITE_SUPABASE_FUNCTIONS_URL');
      if (!session?.access_token) throw new Error('No session');

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ gift_card_id: giftCardId }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.error || 'Delete failed');

      setGiftCards((prev) => prev.filter((g) => g.id !== giftCardId));
      if (selectedGiftCardId === giftCardId) {
        setSelectedGiftCardId(null);
        setSelectedGiftCard(null);
      }
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (session && isAdmin) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isAdmin]);

  const loadOrderDetail = async (orderId) => {
    setErr(null);
    setSelectedOrderId(orderId);
    setSelectedOrder(null);

    const res = await supabase
      .from('orders')
      .select(
        [
          'id,status,fulfillment_status,internal_notes,subtotal_cents,discount_cents,total_cents,currency,created_at,paid_at,customer_id',
          'customers(id,email,phone,full_name)',
          'order_items(id,kind,name,unit_price_cents,qty,meta)',
          'order_events(id,created_at,actor_type,actor_user_id,event_type,payload)',
        ].join(',')
      )
      .eq('id', orderId)
      .single();

    if (res.error) {
      setErr(res.error.message);
      return;
    }

    const order = res.data;
    const events = Array.isArray(order.order_events) ? [...order.order_events] : [];
    events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    order.order_events = events;

    const items = Array.isArray(order.order_items) ? [...order.order_items] : [];
    items.sort((a, b) => String(a.kind).localeCompare(String(b.kind)));
    order.order_items = items;

    setSelectedOrder(order);
    setEditFulfillment(order.fulfillment_status || 'needs_contact');
    setEditNotes(order.internal_notes || '');
  };

  const saveOrderUpdates = async () => {
    if (!selectedOrderId) return;
    setErr(null);
    setBusy(true);
    try {
      const up = await supabase
        .from('orders')
        .update({ fulfillment_status: editFulfillment, internal_notes: editNotes || null })
        .eq('id', selectedOrderId)
        .select('id,fulfillment_status,internal_notes')
        .single();

      if (up.error) throw new Error(up.error.message);
      setSelectedOrder((prev) => (prev ? { ...prev, ...up.data } : prev));
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const anonymizeCustomer = async () => {
    const customerId = selectedOrder?.customer_id;
    if (!customerId) return;
    const ok = window.confirm('Anonimizuoti šio kliento PII (el. paštą / telefoną / vardą)? Šis veiksmas sunkiai atstatomas.');
    if (!ok) return;

    setErr(null);
    setBusy(true);
    try {
      const res = await supabase.rpc('anonymize_customer_pii', { p_customer_id: customerId });
      if (res.error) throw new Error(res.error.message);
      await loadOrderDetail(selectedOrderId);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const disableGiftCard = async (giftCardId) => {
    const ok = window.confirm('Išjungti dovanų kuponą? (status=disabled)');
    if (!ok) return;

    setErr(null);
    setBusy(true);
    try {
      const up = await supabase
        .from('gift_cards')
        .update({ status: 'disabled' })
        .eq('id', giftCardId)
        .select('id,status')
        .single();
      if (up.error) throw new Error(up.error.message);

      setGiftCards((prev) => prev.map((g) => (g.id === giftCardId ? { ...g, status: 'disabled' } : g)));
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const signIn = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setSelectedGiftCardId(null);
    setSelectedGiftCard(null);
  };

  if (!session) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 space-y-4">
        <h1 className="font-heading text-3xl font-extrabold">Prisijungimas</h1>
        {err ? <div className="text-red-600 text-sm">{err}</div> : null}
        <label className="block">
          <span className="text-sm font-semibold">El. paštas</span>
          <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Slaptažodis</span>
          <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="button" onClick={signIn} className="rounded-full glass-green-surface px-6 py-3 text-lg font-extrabold text-black">
          Prisijungti
        </button>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 space-y-4">
        <h1 className="font-heading text-3xl font-extrabold">Administravimas</h1>
        <div className="rounded-2xl border border-black/10 p-5">
          <p className="text-black/80">Šis vartotojas neturi administratoriaus teisių.</p>
          <div className="mt-3 text-sm text-black/70 space-y-1">
            <div><span className="text-black/50">El. paštas:</span> {session?.user?.email || '-'}</div>
            <div><span className="text-black/50">User ID:</span> <span className="font-mono break-all">{session?.user?.id || '-'}</span></div>
          </div>
          <button type="button" onClick={checkAdmin} className="mt-4 underline">Patikrinti dar kartą</button>
          <button type="button" onClick={signOut} className="mt-4 underline">Atsijungti</button>
        </div>
      </main>
    );
  }

  if (isAdmin === null) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 space-y-4">
        <h1 className="font-heading text-3xl font-extrabold">Administravimas</h1>
        {err ? <div className="text-red-600 text-sm">{err}</div> : null}
        <div className="rounded-2xl border border-black/10 p-5">
          <p className="text-black/80">Tikrinamos administratoriaus teisės…</p>
          <div className="mt-3 text-sm text-black/70 space-y-1">
            <div><span className="text-black/50">El. paštas:</span> {session?.user?.email || '-'}</div>
            <div><span className="text-black/50">User ID:</span> <span className="font-mono break-all">{session?.user?.id || '-'}</span></div>
          </div>
          <button type="button" onClick={checkAdmin} className="mt-4 underline">Patikrinti dar kartą</button>
          <button type="button" onClick={signOut} className="mt-4 underline">Atsijungti</button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-extrabold">Administravimas</h1>
        <button type="button" onClick={signOut} className="underline">Atsijungti</button>
      </div>

      {err ? <div className="text-red-600 text-sm">{err}</div> : null}

      <div className="flex gap-3">
        <button type="button" onClick={() => setTab('orders')} className={`rounded-full px-4 py-2 border ${tab === 'orders' ? 'bg-black text-white border-black' : 'border-black/20'}`}>Užsakymai</button>
        <button type="button" onClick={() => setTab('gift_cards')} className={`rounded-full px-4 py-2 border ${tab === 'gift_cards' ? 'bg-black text-white border-black' : 'border-black/20'}`}>Dovanų kuponai</button>
        <button type="button" disabled={busy} onClick={loadData} className="rounded-full px-4 py-2 border border-black/20 disabled:opacity-50">Atnaujinti</button>
      </div>

      {tab === 'orders' ? (
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="overflow-auto rounded-2xl border border-black/10">
            <table className="min-w-full text-sm">
              <thead className="bg-black/5 text-left">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Vykdymas</th>
                  <th className="p-3">Suma</th>
                  <th className="p-3">Klientas</th>
                  <th className="p-3">Sukurta</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr
                    key={o.id}
                    className={`border-t border-black/10 cursor-pointer ${selectedOrderId === o.id ? 'bg-black/5' : ''}`}
                    onClick={() => loadOrderDetail(o.id)}
                    title="Atidaryti detales"
                  >
                    <td className="p-3">{o.status}</td>
                    <td className="p-3">{o.fulfillment_status}</td>
                    <td className="p-3">{formatEurFromCents(o.total_cents)}</td>
                    <td className="p-3">{o.customers?.email}{o.customers?.phone ? ` / ${o.customers.phone}` : ''}</td>
                    <td className="p-3">{new Date(o.created_at).toLocaleString('lt-LT')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-black/10 p-5 space-y-4">
            {!selectedOrder ? (
              <div className="text-black/70 text-sm">Pasirinkite užsakymą sąraše.</div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="text-xs text-black/60">Užsakymas</div>
                  <div className="font-semibold break-all">{selectedOrder.id}</div>
                  <div className="text-sm text-black/70">Status: <span className="font-semibold">{selectedOrder.status}</span></div>
                  <div className="text-sm text-black/70">Suma: <span className="font-semibold">{formatEurFromCents(selectedOrder.total_cents)}</span></div>
                  <div className="text-sm text-black/70">Apmokėta: {selectedOrder.paid_at ? new Date(selectedOrder.paid_at).toLocaleString('lt-LT') : '-'}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-black/60">Klientas</div>
                  <div className="text-sm">{selectedOrder.customers?.full_name || '-'}</div>
                  <div className="text-sm">{selectedOrder.customers?.email || '-'}</div>
                  <div className="text-sm">{selectedOrder.customers?.phone || '-'}</div>
                  <button type="button" disabled={busy} onClick={anonymizeCustomer} className="underline text-sm disabled:opacity-50">
                    Anonimizuoti kliento duomenis
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-black/60">Prekės</div>
                  <div className="space-y-2">
                    {(selectedOrder.order_items || []).map((it) => (
                      <div key={it.id} className="text-sm flex justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{it.name}</div>
                          <div className="text-black/60">{it.kind} • {it.qty} × {formatEurFromCents(it.unit_price_cents)}</div>
                        </div>
                        <div className="shrink-0 font-semibold">{formatEurFromCents(Number(it.unit_price_cents) * Number(it.qty || 1))}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-black/60">Vykdymas</div>
                  <label className="block text-sm">
                    <span className="text-xs text-black/60">Būsena</span>
                    <select className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={editFulfillment} onChange={(e) => setEditFulfillment(e.target.value)}>
                      <option value="needs_contact">needs_contact</option>
                      <option value="contacted">contacted</option>
                      <option value="in_progress">in_progress</option>
                      <option value="delivered">delivered</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs text-black/60">Vidinės pastabos</span>
                    <textarea className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" rows={4} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                  </label>
                  <button type="button" disabled={busy} onClick={saveOrderUpdates} className="rounded-full border border-black/20 px-4 py-2 font-semibold disabled:opacity-50">
                    Išsaugoti
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-black/60">Įvykiai (audit)</div>
                  <div className="max-h-64 overflow-auto rounded-xl border border-black/10 bg-white">
                    {(selectedOrder.order_events || []).length === 0 ? (
                      <div className="p-3 text-sm text-black/60">Nėra įvykių.</div>
                    ) : (
                      <ul className="divide-y divide-black/10">
                        {(selectedOrder.order_events || []).map((ev) => (
                          <li key={ev.id} className="p-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-semibold">{ev.event_type}</div>
                              <div className="text-xs text-black/60">{new Date(ev.created_at).toLocaleString('lt-LT')}</div>
                            </div>
                            <div className="mt-1 text-xs text-black/60 break-words">{ev.actor_type}{ev.actor_user_id ? ` (${ev.actor_user_id})` : ''}</div>
                            <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-black/5 p-2 text-xs">
                              {JSON.stringify(ev.payload || {}, null, 2)}
                            </pre>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="overflow-auto rounded-2xl border border-black/10">
            <table className="min-w-full text-sm">
              <thead className="bg-black/5 text-left">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Likę / Pradinė</th>
                  <th className="p-3">Galioja iki</th>
                  <th className="p-3">Gavėjas</th>
                  <th className="p-3">Pirkėjas</th>
                  <th className="p-3">Veiksmai</th>
                </tr>
              </thead>
              <tbody>
                {giftCards.map((g) => (
                  <tr
                    key={g.id}
                    className={`border-t border-black/10 cursor-pointer ${selectedGiftCardId === g.id ? 'bg-black/5' : ''}`}
                    onClick={() => loadGiftCardDetail(g.id)}
                    title="Atidaryti detales"
                  >
                    <td className="p-3">{g.status}</td>
                    <td className="p-3">{formatEurFromCents(g.remaining_amount_cents)} / {formatEurFromCents(g.initial_amount_cents)}</td>
                    <td className="p-3">{g.expires_at ? new Date(g.expires_at).toLocaleDateString('lt-LT') : '-'}</td>
                    <td className="p-3">{g.recipient_email || '-'}</td>
                    <td className="p-3">{g.buyer_email || '-'}</td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        {g.status === 'active' ? (
                          <button type="button" disabled={busy} onClick={() => disableGiftCard(g.id)} className="underline disabled:opacity-50">
                            Išjungti
                          </button>
                        ) : (
                          <span className="text-black/40">-</span>
                        )}
                        <button type="button" disabled={busy} onClick={() => deleteGiftCard(g.id)} className="underline text-red-700 disabled:opacity-50">
                          Ištrinti
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-black/10 p-5 space-y-6">
            <div className="space-y-3">
              <div className="font-semibold">Kupono detalės</div>
              {!selectedGiftCard ? (
                <div className="text-black/70 text-sm">Pasirinkite kuponą sąraše.</div>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="text-xs text-black/60">ID</div>
                    <div className="font-semibold break-all">{selectedGiftCard.id}</div>
                    <div className="text-sm text-black/70">Likę: <span className="font-semibold">{formatEurFromCents(selectedGiftCard.remaining_amount_cents)}</span></div>
                    <div className="text-sm text-black/70">Pradinė: <span className="font-semibold">{formatEurFromCents(selectedGiftCard.initial_amount_cents)}</span></div>
                    <div className="text-sm text-black/70">Order: <span className="font-semibold">{selectedGiftCard.purchased_order_id || '-'}</span></div>
                  </div>

                  <label className="block text-sm">
                    <span className="text-xs text-black/60">Status</span>
                    <select className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={giftEditStatus} onChange={(e) => setGiftEditStatus(e.target.value)}>
                      <option value="active">active</option>
                      <option value="disabled">disabled</option>
                      <option value="expired">expired</option>
                      <option value="depleted">depleted</option>
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="text-xs text-black/60">Galioja iki (vietinis laikas)</span>
                    <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" type="datetime-local" value={giftEditExpiresAt} onChange={(e) => setGiftEditExpiresAt(e.target.value)} />
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block text-sm">
                      <span className="text-xs text-black/60">Gavėjo vardas</span>
                      <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={giftEditRecipientName} onChange={(e) => setGiftEditRecipientName(e.target.value)} />
                    </label>
                    <label className="block text-sm">
                      <span className="text-xs text-black/60">Gavėjo el. paštas</span>
                      <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={giftEditRecipientEmail} onChange={(e) => setGiftEditRecipientEmail(e.target.value)} type="email" />
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block text-sm">
                      <span className="text-xs text-black/60">Pirkėjo vardas</span>
                      <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={giftEditBuyerName} onChange={(e) => setGiftEditBuyerName(e.target.value)} />
                    </label>
                    <label className="block text-sm">
                      <span className="text-xs text-black/60">Pirkėjo el. paštas</span>
                      <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={giftEditBuyerEmail} onChange={(e) => setGiftEditBuyerEmail(e.target.value)} type="email" />
                    </label>
                  </div>

                  <label className="block text-sm">
                    <span className="text-xs text-black/60">Balanso korekcija (EUR, pvz. -10 arba 5)</span>
                    <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={giftAdjustEur} onChange={(e) => setGiftAdjustEur(e.target.value)} inputMode="decimal" />
                  </label>

                  <div className="flex gap-3">
                    <button type="button" disabled={busy} onClick={saveGiftCardUpdates} className="rounded-full border border-black/20 px-4 py-2 font-semibold disabled:opacity-50">
                      Išsaugoti
                    </button>
                    <button type="button" disabled={busy} onClick={() => deleteGiftCard(selectedGiftCardId)} className="rounded-full border border-red-600/40 px-4 py-2 font-semibold text-red-700 disabled:opacity-50">
                      Ištrinti
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
