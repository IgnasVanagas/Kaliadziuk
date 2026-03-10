import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { addItem, computeSubtotalCents, computeTotalCents, loadCart, removeItem, saveCart } from '../state/cart';
import { formatEurFromCents } from '../lib/money';
import { sendEvent } from '../lib/tracking';
import BotProtectionCheck from '../components/BotProtectionCheck.jsx';

const stripePromise = (() => {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return pk ? loadStripe(pk) : null;
})();

function functionUrl(name) {
  const base = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${name}`;
}

function functionHeaders(accessToken) {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) return { 'Content-Type': 'application/json' };
  
  const headers = {
    'Content-Type': 'application/json',
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

const PRODUCT_FEATURES = {
  '11111111-1111-1111-1111-111111111111': {
    lt: ['Individualus sporto planas', 'Aiškios mitybos gairės', 'Technikos korekcijos'],
    en: ['Individual training plan', 'Clear nutrition guidance', 'Technique corrections']
  },
  '22222222-2222-2222-2222-222222222222': {
    lt: ['Individualus sporto planas', 'Mitybos gairės masei', 'Technikos korekcijos'],
    en: ['Individual training plan', 'Nutrition guidance for mass', 'Technique corrections']
  },
  '33333333-3333-3333-3333-333333333333': {
    lt: ['Individualus namų planas', 'Pratimų video biblioteka', 'Technikos įvedimas'],
    en: ['Individual home plan', 'Exercise video library', 'Technique onboarding']
  },
  '44444444-4444-4444-4444-444444444444': {
    lt: ['Mobilumo planas kasdienai', 'Judesio video seka', 'Laikysenos gerinimas'],
    en: ['Daily mobility plan', 'Video movement sequence', 'Posture improvements']
  },
  '55555555-5555-5555-5555-555555555555': {
    lt: ['Kasdienė komunikacija', 'Neribotos konsultacijos', 'Technikos video analizė'],
    en: ['Daily communication', 'Unlimited consultations', 'Technique video analysis']
  },
  '66666666-6666-6666-6666-666666666666': {
    lt: ['Individualus namų planas', 'Kasdienis trenerio ryšys', 'Video technikos analizė'],
    en: ['Individual home plan', 'Daily trainer connection', 'Video technique analysis']
  },
};

const DEFAULT_FEATURES = {
  lt: ['Individualus sporto planas', 'Aiškios mitybos gairės', 'Technikos korekcijos'],
  en: ['Individual training plan', 'Clear nutrition guidance', 'Technique corrections']
};

export default function Cart() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const location = useLocation();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const PRIVATE_TEST_PRODUCT_ID = 'private_test_1eur';
  const canShowTestUi = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search || '');
      return params.get('test') === '1';
    } catch {
      return false;
    }
  }, [location.search]);

  const checkoutDraftKey = useMemo(() => `checkout_draft_${locale}`, [locale]);

  const [cart, setCart] = useState(() => loadCart());
  const [giftCodeInput, setGiftCodeInput] = useState(cart.giftCode || '');

  const hasPrivateTestItem = useMemo(
    () => (cart?.items || []).some((it) => String(it?.productId || '') === PRIVATE_TEST_PRODUCT_ID),
    [cart]
  );

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('+370');
  const [fullName, setFullName] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [uiError, setUiError] = useState(null);

  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || null;

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(checkoutDraftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft && typeof draft === 'object') {
        // Restore contact fields from sessionStorage (tab-scoped: clears when tab is closed).
        // sessionStorage is appropriate here — it is never shared across tabs or persisted to disk
        // beyond the browser session, so accidental PII leakage risk is minimal.
        if (typeof draft.email === 'string') setEmail(draft.email);
        if (typeof draft.phone === 'string') setPhone(draft.phone);
        if (typeof draft.fullName === 'string') setFullName(draft.fullName);
        if (typeof draft.phoneCode === 'string') setPhoneCode(draft.phoneCode);
        if (typeof draft.marketing === 'boolean') setMarketing(draft.marketing);
        if (typeof draft.acceptTerms === 'boolean') setAcceptTerms(draft.acceptTerms);
        if (typeof draft.acceptPrivacy === 'boolean') setAcceptPrivacy(draft.acceptPrivacy);
      }
    } catch {
      // ignore
    }
  }, [checkoutDraftKey]);

  useEffect(() => {
    try {
      // Store contact details in sessionStorage (tab-scoped, cleared on tab close).
      // We intentionally include email/phone/name so users don't lose entered data on
      // accidental refresh. sessionStorage is NOT shared across tabs or persisted beyond
      // the current browser session — this is a deliberate, safe trade-off.
      sessionStorage.setItem(
        checkoutDraftKey,
        JSON.stringify({
          email,
          phone,
          fullName,
          marketing,
          acceptTerms,
          acceptPrivacy,
          phoneCode,
        })
      );
    } catch {
      // ignore
    }
  }, [checkoutDraftKey, email, phone, fullName, marketing, acceptTerms, acceptPrivacy, phoneCode]);

  const subtotal = computeSubtotalCents(cart);
  const total = computeTotalCents(cart);
  const base = `/${locale}`;
  const termsPath = locale === 'lt' ? '/lt/taisykles/' : '/en/terms/';
  const privacyPath = locale === 'lt' ? '/lt/privatumas/' : '/en/privacy/';

  const onRemove = (index) => {
    setCart(c => removeItem(c, index));
  };

  const onApplyGiftCode = async () => {
    setUiError(null);
    const url = functionUrl('validate-gift-card');
    if (!url) {
      setUiError('Missing VITE_SUPABASE_FUNCTIONS_URL');
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
        headers: functionHeaders(session?.access_token),
        body: JSON.stringify({ code, cart_subtotal_cents: subtotal }),
      });
      const body = await resp.json();
      if (!resp.ok) throw new Error(body?.error || 'Gift card invalid');
      setCart(c => ({ ...c, giftCode: code, giftDiscountCents: body.discount_cents || 0 }));
    } catch (e) {
      setUiError(e?.message || String(e));
      setCart(c => ({ ...c, giftCode: null, giftDiscountCents: 0 }));
    } finally {
      setBusy(false);
    }
  };

  const onCheckout = async () => {
    setUiError(null);
    const url = functionUrl('create-payment-intent');
    if (!url) {
      setUiError('Missing VITE_SUPABASE_FUNCTIONS_URL');
      return;
    }
    if (!stripePromise) {
      setUiError('Missing VITE_STRIPE_PUBLISHABLE_KEY');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setUiError(locale === 'lt' ? 'Įveskite el. paštą.' : 'Email is required.');
      return;
    }
    if (!emailRegex.test(email)) {
      setUiError(locale === 'lt' ? 'Neteisingas el. pašto formatas.' : 'Invalid email format.');
      return;
    }

    if (!phone) {
      setUiError(locale === 'lt' ? 'Įveskite telefono numerį.' : 'Phone number is required.');
      return;
    }
    const fullPhone = phoneCode + phone.replace(/\s+/g, '');
    const phoneRegex = /^\+\d{8,15}$/;
    if (!phoneRegex.test(fullPhone)) {
      setUiError(locale === 'lt' ? 'Neteisingas telefono numeris.' : 'Invalid phone number format.');
      return;
    }

    if (!fullName || fullName.trim().length < 2) {
      setUiError(locale === 'lt' ? 'Įveskite vardą ir pavardę.' : 'Full name is required.');
      return;
    }

    if (!acceptTerms || !acceptPrivacy) {
      setUiError(locale === 'lt' ? 'Pažymėkite taisykles ir privatumo politiką.' : 'Please accept terms and privacy policy.');
      return;
    }
    if (cart.items.length === 0) {
      setUiError(locale === 'lt' ? 'Krepšelis tuščias.' : 'Cart is empty.');
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setUiError(locale === 'lt' ? 'Prašome patvirtinti, kad esate žmogus.' : 'Please verify you are a human.');
      return;
    }

    setBusy(true);
    try {
      const origin = window.location.origin;

      // Private test checkout: require a token and send it as a header.
      let testCheckoutToken = null;
      if (hasPrivateTestItem) {
        try {
          testCheckoutToken = sessionStorage.getItem('test_checkout_token') || null;
        } catch {
          // ignore
        }

        if (!testCheckoutToken) {
          const entered = window.prompt(locale === 'lt' ? 'Įveskite TEST_CHECKOUT_TOKEN:' : 'Enter TEST_CHECKOUT_TOKEN:');
          if (!entered) throw new Error(locale === 'lt' ? 'Test token reikalingas.' : 'Test token is required.');
          testCheckoutToken = String(entered).trim();
          try {
            sessionStorage.setItem('test_checkout_token', testCheckoutToken);
          } catch {
            // ignore
          }
        }
      }

      sendEvent('begin_checkout', {
        currency: 'EUR',
        value: total / 100,
        items: cart.items.map((it) => ({
          item_id: it.productId || 'gift_card',
          item_name: it.name,
          price: (it.unitPriceCents || 0) / 100,
          quantity: it.qty || 1,
        })),
      });

      // Save analytics data for the success page
      try {
        sessionStorage.setItem('analytics_purchase_pending', JSON.stringify({
          currency: 'EUR',
          value: total / 100,
          items: cart.items.map((it) => ({
            item_id: it.productId || 'gift_card',
            item_name: it.name,
            price: (it.unitPriceCents || 0) / 100,
            quantity: it.qty || 1,
          })),
        }));
      } catch {
        // ignore
      }

      const headers = functionHeaders(session?.access_token);

      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          locale,
          origin,
          gift_code: cart.giftCode,
          cf_turnstile_response: turnstileToken,
          test_checkout_token: hasPrivateTestItem ? testCheckoutToken : undefined,
          items: cart.items,
          customer: {
            email,
            phone: fullPhone,
            full_name: fullName,
            marketing_opt_in: marketing,
            accept_terms: acceptTerms,
            accept_privacy: acceptPrivacy,
          },
        }),
      });
      const body = await resp.json();
      if (!resp.ok) {
        if (body?.error === 'captcha_failed') {
          setTurnstileToken(null);
          setTurnstileResetSignal(s => s + 1);
          throw new Error(locale === 'lt' ? 'Nepavyko patvirtinti, kad esate žmogus. Bandykite dar kartą.' : 'Human verification failed. Please try again.');
        }
        throw new Error(body?.error || 'Payment init failed');
      }

      if (body?.zero_total) {
        window.location.assign(`${origin}${locale === 'lt' ? '/lt/sekme' : '/en/success'}`);
        return;
      }

      if (!body?.client_secret) throw new Error('Missing client_secret');
      setOrderId(body.order_id || null);

      try {
        const paymentToken = crypto.randomUUID();
        sessionStorage.setItem(
          `ps_${paymentToken}`,
          JSON.stringify({
            order_id: body.order_id,
            client_secret: body.client_secret,
            total_cents: body.total_cents,
            currency: body.currency || 'eur',
          })
        );
        // Keep the checkout draft in sessionStorage so contact fields are restored
        // if the user returns after a failed payment. The draft expires naturally
        // when the tab is closed (sessionStorage is tab-scoped).
        window.location.assign(`${origin}${locale === 'lt' ? '/lt/mokejimas' : '/en/payment'}?pt=${encodeURIComponent(paymentToken)}`);
      } catch {
        // Fallback: navigate without session (Payment page will show error)
        window.location.assign(`${origin}${locale === 'lt' ? '/lt/mokejimas' : '/en/payment'}`);
      }
    } catch (e) {
      setUiError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 lg:px-6 py-8 lg:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl font-extrabold">{t('cart.title')}</h1>
        {canShowTestUi ? (
          <button
            type="button"
            className="rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-semibold hover:border-black/40"
            onClick={() => {
              setUiError(null);
              setCart((c) => {
                const next = addItem(c, {
                  kind: 'product',
                  productId: PRIVATE_TEST_PRODUCT_ID,
                  name: locale === 'lt' ? 'Testinis apmokėjimas (privatus) – 1€' : 'Test payment (private) – €1',
                  unitPriceCents: 100,
                  qty: 1,
                });
                return { ...next, giftCode: null, giftDiscountCents: 0 };
              });
            }}
          >
            {locale === 'lt' ? 'Pridėti €1 testą' : 'Add €1 test'}
          </button>
        ) : null}
      </div>

      

      {cart.items.length === 0 ? (
        <p className="text-black/70">{t('cart.empty')}</p>
      ) : (
        <div className="rounded-2xl border border-black/10 overflow-hidden bg-white shadow-sm">
          <div className="flex flex-col divide-y divide-black/5">
            {cart.items.map((it, idx) => (
              <div key={idx} className="p-4 flex items-start sm:items-center gap-3 relative">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover border border-black/5 shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <div className="flex-1 min-w-0 pr-6 sm:pr-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <div className="font-semibold text-[15px] leading-tight truncate">{it.name}</div>
                    <div className="font-bold sm:text-right shrink-0">
                      {it.qty > 1 ? <span className="text-sm font-normal text-black/50 mr-2">{it.qty} × {formatEurFromCents(it.unitPriceCents)}</span> : null}
                      {formatEurFromCents((it.unitPriceCents || 0) * (it.qty || 1))}
                    </div>
                  </div>
                  <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-black/70">
                    {(PRODUCT_FEATURES[it.productId]?.[locale] || DEFAULT_FEATURES[locale]).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-accent text-black">
                          <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute right-3 top-3 sm:top-auto sm:relative sm:right-auto p-1.5 text-black/30 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                  aria-label={t('cart.remove')}
                >
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-black/5 p-4 bg-white flex flex-col gap-1 text-sm">
            {(cart.giftDiscountCents || 0) > 0 && <div className="flex justify-between text-green-600 font-medium pb-1.5"><span>{t('cart.discount')}</span><span>-{formatEurFromCents(Math.min(subtotal, cart.giftDiscountCents || 0))}</span></div>}
            <div className="flex justify-between items-center font-bold text-xl">
              <span>{t('cart.total')}</span>
              <span>{formatEurFromCents(total)}</span>
            </div>
          </div>

          <div className="border-t border-black/5 bg-black/[0.02] p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3">
             <div className="font-semibold text-sm shrink-0 w-full sm:w-auto">{t('cart.giftCode')}</div>
             <div className="flex w-full flex-1 gap-2">
              <input
                className="w-full flex-1 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-black/30 transition-colors"
                value={giftCodeInput}
                onChange={e => setGiftCodeInput(e.target.value)}
                placeholder={t('cart.giftCodePlaceholder')}
              />
              <button
                type="button"
                disabled={busy}
                onClick={onApplyGiftCode}
                className="shrink-0 rounded-lg bg-black px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:opacity-50"
              >
                {t('cart.apply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {cart.items.length > 0 && (
        <details className="group rounded-2xl border border-black/10 bg-white overflow-hidden shadow-sm">
          <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold outline-none hover:bg-black/[0.02]">
            {locale === 'lt' ? 'O kas bus po pirkimo?' : 'What happens after purchase?'}
            <svg className="h-5 w-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </summary>
          <div className="border-t border-black/10 p-4 text-sm text-black/80 space-y-2">
            {locale === 'lt' ? (
              <ul className="space-y-2.5 list-none">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>Susisieksiu su tavimi iš karto</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>Maksimaliai individualų planą</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>2 konsultacijos įskaičiuotos</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>Išmoksi rūpintis savimi už sporto salės ribų</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>Aiškų sporto planą ir lanksčias mitybos gaires</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>Moksliškai pagrįstą ir praktiškai patikrintą sistemą</li>
              </ul>
            ) : (
              <ul className="space-y-2.5 list-none">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>I will contact you immediately</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>Maximally personalized plan</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>2 consultations included</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>You will learn to take care of yourself outside the gym</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>Clear workout plan and flexible nutrition guidelines</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-black ring-1 ring-black/10"><svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></span>Scientifically based and practically proven system</li>
              </ul>
            )}
          </div>
        </details>
      )}

      <div className="rounded-2xl border border-black/10 p-5 space-y-4">
        <div className="font-heading font-extrabold">{t('cart.contact.title')}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">{t('cart.contact.email')}</span>
            <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">{t('cart.contact.phone')}</span>
            <div className="mt-1 flex gap-2">
              <select className="w-1/3 rounded-xl border border-black/20 px-3 py-2 bg-white" value={phoneCode} onChange={e => setPhoneCode(e.target.value)}> 
                  
                  <option value="+370">LT (+370)</option>
                  <option value="+43">AT (+43)</option>
                  <option value="+32">BE (+32)</option>
                  <option value="+359">BG (+359)</option>
                  <option value="+357">CY (+357)</option>
                  <option value="+420">CZ (+420)</option>
                  <option value="+49">DE (+49)</option>
                  <option value="+45">DK (+45)</option>
                  <option value="+372">EE (+372)</option>
                  <option value="+34">ES (+34)</option>
                  <option value="+358">FI (+358)</option>
                  <option value="+33">FR (+33)</option>
                  <option value="+30">GR (+30)</option>
                  <option value="+385">HR (+385)</option>
                  <option value="+36">HU (+36)</option>
                  <option value="+353">IE (+353)</option>
                  <option value="+39">IT (+39)</option>
                  <option value="+352">LU (+352)</option>
                  <option value="+371">LV (+371)</option>
                  <option value="+356">MT (+356)</option>
                  <option value="+31">NL (+31)</option>
                  <option value="+48">PL (+48)</option>
                  <option value="+351">PT (+351)</option>
                  <option value="+40">RO (+40)</option>
                  <option value="+46">SE (+46)</option>
                  <option value="+386">SI (+386)</option>
                  <option value="+421">SK (+421)</option>
                  <option value="+44">UK (+44)</option>
                  <option value="+1">US (+1)</option>
                </select>
              <input type="tel" className="w-2/3 rounded-xl border border-black/20 px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} placeholder="61234567" />
            </div>
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-semibold">{t('cart.contact.fullName')}</span>
          <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={fullName} onChange={e => setFullName(e.target.value)} />
        </label>

        <label className="flex items-center gap-3 text-sm text-black cursor-pointer group">
          <div className="relative flex h-5 w-5 items-center justify-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={marketing}
              onChange={e => setMarketing(e.target.checked)}
            />
            <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white transition-all peer-checked:border-[#DCF41E] peer-checked:bg-[#DCF41E] peer-focus:ring-2 peer-focus:ring-[#DCF41E] peer-focus:ring-offset-2"></div>
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 transition-opacity peer-checked:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span>{t('cart.contact.marketing')}</span>
        </label>

        <label className="flex items-center gap-3 text-sm text-black cursor-pointer group">
          <div className="relative flex h-5 w-5 items-center justify-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={acceptTerms && acceptPrivacy}
              onChange={e => {
                setAcceptTerms(e.target.checked);
                setAcceptPrivacy(e.target.checked);
              }}
            />
            <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white transition-all peer-checked:border-[#DCF41E] peer-checked:bg-[#DCF41E] peer-focus:ring-2 peer-focus:ring-[#DCF41E] peer-focus:ring-offset-2"></div>
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 transition-opacity peer-checked:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span>
            {locale === 'lt' ? 'Sutinku su ' : 'I accept the '}
            <Link to={termsPath} onClick={(e) => e.stopPropagation()} className="underline underline-offset-2 hover:text-accent">
              {t('legal.terms')}
            </Link>
            {locale === 'lt' ? ' ir ' : ' and '}
            <Link to={privacyPath} onClick={(e) => e.stopPropagation()} className="underline underline-offset-2 hover:text-accent">
              {t('legal.privacy')}
            </Link>
            <span className="text-red-600"> *</span>
          </span>
        </label>

        {turnstileSiteKey ? (
          <BotProtectionCheck
            locale={locale}
            checkId="cart_checkout"
            value={turnstileToken}
            onChange={setTurnstileToken}
            resetSignal={turnstileResetSignal}
          />
        ) : null}

        <button
          type="button"
          disabled={busy || cart.items.length === 0}
          onClick={onCheckout}
          className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 text-lg font-extrabold text-black disabled:opacity-50"
        >
          {t('cart.checkout')}
        </button>
      </div>

      {uiError ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 relative scale-100 animate-in zoom-in-95 duration-200 border-l-4 border-red-500">
            <button
              onClick={() => setUiError(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={locale === 'lt' ? 'Uždaryti' : 'Close'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{locale === 'lt' ? 'Klaida' : 'Error'}</h3>
              <p className="text-gray-600 whitespace-pre-line">{uiError}</p>
              <button
                onClick={() => setUiError(null)}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all transform active:scale-95"
              >
                {locale === 'lt' ? 'Supratau' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Keep orderId referenced for debugging/QA without changing UX */}
      {orderId ? <span className="sr-only">{orderId}</span> : null}
    </main>
  );
}
