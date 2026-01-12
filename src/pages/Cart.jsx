import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { computeSubtotalCents, computeTotalCents, loadCart, removeItem, saveCart } from '../state/cart';
import { formatEurFromCents } from '../lib/money';
const stripePromise = (() => {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return pk ? loadStripe(pk) : null;
})();

function functionUrl(name) {
  const base = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${name}`;
}

export default function Cart() {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const [cart, setCart] = useState(() => loadCart());
  const [giftCodeInput, setGiftCodeInput] = useState(cart.giftCode || '');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const subtotal = computeSubtotalCents(cart);
  const total = computeTotalCents(cart);
  const base = `/${locale}`;

  const onRemove = (index) => {
    setCart(c => removeItem(c, index));
  };

  const onApplyGiftCode = async () => {
    const url = functionUrl('validate-gift-card');
    if (!url) {
      alert('Missing VITE_SUPABASE_FUNCTIONS_URL');
      return;
    }

    const code = String(giftCodeInput || '').trim();
    if (!code) {
      setCart(c => ({ ...c, giftCode: null, giftDiscountCents: 0 }));
      return;
    }

    setBusy(true);
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cart_subtotal_cents: subtotal }),
      });
      const body = await resp.json();
      if (!resp.ok) throw new Error(body?.error || 'Gift card invalid');
      setCart(c => ({ ...c, giftCode: code, giftDiscountCents: body.discount_cents || 0 }));
    } catch (e) {
      alert(e.message || String(e));
      setCart(c => ({ ...c, giftCode: null, giftDiscountCents: 0 }));
    } finally {
      setBusy(false);
    }
  };

  const onCheckout = async () => {
    const url = functionUrl('create-payment-intent');
    if (!url) {
      alert('Missing VITE_SUPABASE_FUNCTIONS_URL');
      return;
    }
    if (!stripePromise) {
      alert('Missing VITE_STRIPE_PUBLISHABLE_KEY');
      return;
    }
    if (!email) {
      alert('Email required');
      return;
    }
    if (!acceptTerms || !acceptPrivacy) {
      alert('Accept terms and privacy');
      return;
    }
    if (cart.items.length === 0) {
      alert('Cart empty');
      return;
    }

    setBusy(true);
    try {
      const origin = window.location.origin;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          origin,
          gift_code: cart.giftCode,
          items: cart.items,
          customer: {
            email,
            phone,
            full_name: fullName,
            marketing_opt_in: marketing,
            accept_terms: acceptTerms,
            accept_privacy: acceptPrivacy,
          },
        }),
      });
      const body = await resp.json();
      if (!resp.ok) throw new Error(body?.error || 'Payment init failed');

      if (body?.zero_total) {
        window.location.assign(`${origin}${locale === 'lt' ? '/lt/sekme' : '/en/success'}`);
        return;
      }

      if (!body?.client_secret) throw new Error('Missing client_secret');
      setOrderId(body.order_id || null);

      try {
        sessionStorage.setItem(
          `payment_intent_${body.order_id}`,
          JSON.stringify({
            client_secret: body.client_secret,
            total_cents: body.total_cents,
            currency: body.currency || 'eur',
          })
        );
      } catch {
        // ignore
      }

      window.location.assign(`${origin}${locale === 'lt' ? '/lt/mokejimas' : '/en/payment'}?order_id=${encodeURIComponent(body.order_id)}`);
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl font-extrabold">{t('cart.title')}</h1>
      </div>

      {cart.items.length === 0 ? (
        <p className="text-black/70">{t('cart.empty')}</p>
      ) : (
        <div className="space-y-3">
          {cart.items.map((it, idx) => (
            <div key={idx} className="rounded-2xl border border-black/10 p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={it.name ? String(it.name) : ''}
                    className="h-14 w-14 rounded-xl object-cover border border-black/10"
                    loading="lazy"
                  />
                ) : null}
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-black/60">{it.qty} × {formatEurFromCents(it.unitPriceCents)}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:border-accent"
                aria-label={t('cart.remove')}
                title={t('cart.remove')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l1 16h10l1-16" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-black/10 p-5 space-y-3">
        <div className="font-heading font-extrabold">{t('cart.giftCode')}</div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-black/20 px-3 py-2"
            value={giftCodeInput}
            onChange={e => setGiftCodeInput(e.target.value)}
            placeholder={t('cart.giftCodePlaceholder')}
          />
          <button type="button" disabled={busy} onClick={onApplyGiftCode} className="rounded-full border border-black/20 px-4 py-2 font-semibold">
            {t('cart.apply')}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 p-5 space-y-2">
        <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{formatEurFromCents(subtotal)}</span></div>
        <div className="flex justify-between"><span>{t('cart.discount')}</span><span>-{formatEurFromCents(Math.min(subtotal, cart.giftDiscountCents || 0))}</span></div>
        <div className="flex justify-between font-heading font-extrabold text-lg"><span>{t('cart.total')}</span><span>{formatEurFromCents(total)}</span></div>
      </div>

      <div className="rounded-2xl border border-black/10 p-5 space-y-4">
        <div className="font-heading font-extrabold">{t('cart.contact.title')}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">{t('cart.contact.email')}</span>
            <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">{t('cart.contact.phone')}</span>
            <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-semibold">{t('cart.contact.fullName')}</span>
          <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={fullName} onChange={e => setFullName(e.target.value)} />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} />
          <span>{t('cart.contact.marketing')}</span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
          <span>{t('cart.contact.acceptTerms')} <span className="text-red-600">*</span></span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={acceptPrivacy} onChange={e => setAcceptPrivacy(e.target.checked)} />
          <span>{t('cart.contact.acceptPrivacy')} <span className="text-red-600">*</span></span>
        </label>

        <button
          type="button"
          disabled={busy || cart.items.length === 0}
          onClick={onCheckout}
          className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 text-lg font-extrabold text-black disabled:opacity-50"
        >
          {t('cart.checkout')}
        </button>

        <p className="text-xs text-black/60">{t('cart.checkoutNote')}</p>
      </div>

      {/* Keep orderId referenced for debugging/QA without changing UX */}
      {orderId ? <span className="sr-only">{orderId}</span> : null}
    </main>
  );
}
