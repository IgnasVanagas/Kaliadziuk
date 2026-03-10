import { Elements, ExpressCheckoutElement, PaymentElement, PaymentRequestButtonElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CLEAR_CART_FLAG_KEY = 'clear_cart_after_success_v1';

const stripePromise = (() => {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return pk ? loadStripe(pk) : null;
})();

function paymentPath(locale) {
  return locale === 'lt' ? '/lt/mokejimas' : '/en/payment';
}

function successPath(locale) {
  return locale === 'lt' ? '/lt/sekme' : '/en/success';
}

function cancelPath(locale) {
  return locale === 'lt' ? '/lt/atsaukta' : '/en/cancel';
}

function readPaymentSession(token) {
  if (!token) return null;
  try {
    const raw = sessionStorage.getItem(`ps_${token}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearPaymentSession(token) {
  if (!token) return;
  try {
    sessionStorage.removeItem(`ps_${token}`);
  } catch {
    // ignore
  }
}

function markCartToClearAfterSuccess(orderId) {
  try {
    // We clear the cart on the Success page so it works even after 3DS redirects.
    sessionStorage.setItem(CLEAR_CART_FLAG_KEY, orderId || '1');
  } catch {
    // ignore
  }
}

function unmarkCartToClearAfterSuccess() {
  try {
    sessionStorage.removeItem(CLEAR_CART_FLAG_KEY);
  } catch {
    // ignore
  }
}

function localizePaymentError(err, locale, t) {
  const lang = locale === 'en' ? 'en' : 'lt';
  const code = String(err?.code || '').toLowerCase();

  if (code === 'card_declined') {
    return lang === 'lt'
      ? 'Mokėjimas atmestas. Patikrinkite kortelės duomenis arba bandykite kitą kortelę.'
      : 'Payment was declined. Please check your card details or try another card.';
  }

  if (code === 'expired_card') {
    return lang === 'lt'
      ? 'Mokėjimas atmestas. Patikrinkite kortelės duomenis arba bandykite kitą kortelę.'
      : 'Payment was declined. Please check your card details or try another card.';
  }

  if (code === 'incorrect_cvc') {
    return lang === 'lt'
      ? 'Mokėjimas atmestas. Patikrinkite kortelės duomenis arba bandykite kitą kortelę.'
      : 'Payment was declined. Please check your card details or try another card.';
  }

  if (code === 'processing_error' || code === 'api_connection_error' || code === 'api_error') {
    return lang === 'lt'
      ? 'Mokėjimo apdorojimo klaida. Pabandykite dar kartą po kelių akimirkų.'
      : 'Payment processing error. Please try again in a moment.';
  }

  // Don't pass raw backend error messages to the user — use the generic fallback.
  return t('cart.payment.failed');
}

function InnerPayment({ locale, orderId, paymentToken, clientSecret, totalCents, currency }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();

  const [busy, setBusy] = useState(false);
  const [errorPopup, setErrorPopup] = useState(null);

  // ExpressCheckoutElement state — mounted always so onReady fires regardless of results.
  const [expressAvailable, setExpressAvailable] = useState(false);
  const [expressWallets, setExpressWallets] = useState(null);
  // Fallback PaymentRequestButtonElement for browsers (e.g. Edge) where ECE doesn't
  // surface Google Pay / Apple Pay but the browser's native Payment Request API does.
  const [fallbackPR, setFallbackPR] = useState(null);
  const [fallbackWallet, setFallbackWallet] = useState(null);

  const returnUrl = `${window.location.origin}${successPath(locale)}`;

  const openErrorPopup = (value) => {
    const message = typeof value === 'string' ? value : localizePaymentError(value, locale, t);
    setErrorPopup({
      title: locale === 'lt' ? 'Klaida' : 'Error',
      message: String(message || t('cart.payment.failed')),
    });
  };

  // Called by ECE once it has determined which wallets are available (or none).
  const onExpressReady = ({ availablePaymentMethods }) => {
    if (!availablePaymentMethods) return;
    setExpressWallets(availablePaymentMethods);
    // Only flag "available" when at least one method is actually usable —
    // this ensures the express section shows for PayPal-only scenarios too
    // (e.g. device has no Google Pay / Apple Pay but PayPal is available).
    const hasMethod = availablePaymentMethods.googlePay
      || availablePaymentMethods.applePay
      || availablePaymentMethods.paypal;
    if (hasMethod) setExpressAvailable(true);
  };

  // Called after the user approves payment in their wallet (Google Pay / Apple Pay / PayPal).
  // redirect: 'if_required' completes inline when possible (no 3DS needed) so the user
  // never gets sent to a blank intermediate page for wallet payments.
  const onExpressConfirm = async () => {
    if (!stripe || !elements) return;
    setErrorPopup(null);
    setBusy(true);
    markCartToClearAfterSuccess(orderId);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    });
    if (error) {
      unmarkCartToClearAfterSuccess();
      openErrorPopup(error || t('cart.payment.failed'));
      setBusy(false);
    } else {
      // Confirmed inline — navigate to success ourselves.
      clearPaymentSession(paymentToken);
      window.location.assign(returnUrl);
    }
  };

  // Set up a Payment Request fallback for browsers (e.g. Edge) where ECE doesn't
  // detect Google Pay but the native Payment Request API does.
  useEffect(() => {
    if (!stripe || !clientSecret || !totalCents) return;
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return;

    const pr = stripe.paymentRequest({
      country: 'LT',
      currency: (currency || 'eur').toLowerCase(),
      total: { label: t('payment.totalLabel'), amount: Number(totalCents || 0) },
      requestPayerEmail: true,
      requestPayerName: true,
    });

    let cancelled = false;
    pr.canMakePayment().then((result) => {
      if (cancelled || !result) return;
      const wallet = result.googlePay ? 'googlePay' : result.applePay ? 'applePay' : null;
      if (!wallet) return;

      pr.on('paymentmethod', async (ev) => {
        setErrorPopup(null);
        setBusy(true);
        markCartToClearAfterSuccess(orderId);
        try {
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );
          if (confirmError) {
            unmarkCartToClearAfterSuccess();
            ev.complete('fail');
            openErrorPopup(confirmError || t('cart.payment.failed'));
            return;
          }
          ev.complete('success');
          if (paymentIntent?.status === 'requires_action') {
            const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
            if (actionError) {
              unmarkCartToClearAfterSuccess();
              openErrorPopup(actionError || t('cart.payment.failed'));
              return;
            }
          }
          clearPaymentSession(paymentToken);
          window.location.assign(returnUrl);
        } catch (e) {
          unmarkCartToClearAfterSuccess();
          ev.complete('fail');
          openErrorPopup(e || t('cart.payment.failed'));
        } finally {
          setBusy(false);
        }
      });

      setFallbackPR(pr);
      setFallbackWallet(wallet);
    });

    return () => { cancelled = true; };
  }, [stripe, clientSecret, totalCents, currency, t, orderId, paymentToken, returnUrl]);

  const onPay = async () => {
    setErrorPopup(null);

    if (!stripe || !elements) {
      openErrorPopup(t('cart.payment.notReady'));
      return;
    }

    setBusy(true);
    try {
      markCartToClearAfterSuccess(orderId);
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
      });

      if (confirmError) {
        unmarkCartToClearAfterSuccess();
        openErrorPopup(confirmError || t('cart.payment.failed'));
        return;
      }

      clearPaymentSession(paymentToken);
      window.location.assign(returnUrl);
    } finally {
      setBusy(false);
    }
  };

  // showFallbackWallet: ECE didn't detect the wallet that the browser's native
  // Payment Request API found (e.g. Google Pay on Edge, or Apple Pay on older Safari).
  const showFallbackWallet = !!fallbackPR && !!fallbackWallet && !expressWallets?.[fallbackWallet];
  const showExpressSection = expressAvailable || showFallbackWallet;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-extrabold">{t('payment.title')}</h1>
        <p className="text-black/70">{t('payment.subtitle')}</p>
      </div>

      {/* Order Summary Sidebar on mobile */}
      <div className="rounded-2xl border-2 border-accent/20 bg-accent/5 p-4 flex justify-between items-center mb-6">
        <div className="font-semibold text-lg">{locale === 'lt' ? 'Suma apmokėjimui:' : 'Total to pay:'}</div>
        <div className="text-2xl font-extrabold font-heading">{totalCents ? (totalCents / 100).toFixed(2).replace('.', ',') + ' €' : ''}</div>
      </div>
      
      {/* ECE is always mounted so Stripe can detect available wallets.
           A PaymentRequestButtonElement fallback handles Google Pay in Edge and
           other Chromium browsers where ECE's detection doesn't fire. */}
      <div className={showExpressSection ? 'rounded-2xl border border-black/10 p-5 space-y-3' : ''}>
        {showExpressSection && (
          <div className="font-heading font-extrabold">{t('payment.expressTitle')}</div>
        )}
        <ExpressCheckoutElement
          onReady={onExpressReady}
          onConfirm={onExpressConfirm}
          options={{
            buttonHeight: 48,
            buttonType: { applePay: 'buy', googlePay: 'buy', paypal: 'buynow' },
            buttonTheme: { applePay: 'black', googlePay: 'black', paypal: 'gold' },
            paymentMethods: { link: 'never', applePay: 'auto', googlePay: 'auto', paypal: 'auto' },
          }}
        />
        {showFallbackWallet && (
          <PaymentRequestButtonElement
            options={{
              paymentRequest: fallbackPR,
              style: { paymentRequestButton: { theme: 'dark', height: '48px', type: 'default' } },
            }}
          />
        )}
        {showExpressSection && (
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#f2f2f5] px-2 text-sm text-black/40 uppercase tracking-wide font-medium">
                {t('payment.orPayWithCard')}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-black/10 p-5 space-y-4">
        <div className="font-heading font-extrabold">{t('payment.cardTitle')}</div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        <button
          type="button"
          disabled={busy || !stripe || !elements}
          onClick={onPay}
          className="w-full rounded-full glass-green-surface px-4 py-3 font-extrabold text-black transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60"
          aria-busy={busy ? 'true' : 'false'}
        >
          {busy ? t('cart.payment.processing') : t('cart.payment.pay')}
        </button>

        <a href={cancelPath(locale)} className="block text-center text-sm font-medium text-black/70 hover:text-black">
          {t('payment.cancelLink')}
        </a>
      </div>

      {errorPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 relative scale-100 animate-in zoom-in-95 duration-200 border-l-4 border-red-500">
            <button
              onClick={() => setErrorPopup(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={locale === 'lt' ? 'Uždaryti' : 'Close'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900">{errorPopup.title}</h3>

              <p className="text-gray-600 whitespace-pre-line">{errorPopup.message}</p>

              <button
                onClick={() => setErrorPopup(null)}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all transform active:scale-95"
              >
                {locale === 'lt' ? 'Supratau' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function Payment() {
  const { t } = useTranslation();
  const location = useLocation();

  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const paymentToken = params.get('pt');

  // Read payment session from sessionStorage. Keep it there so the page
  // survives a refresh — sessionStorage is tab-scoped and will be cleared
  // automatically when the tab closes.  We only remove it on payment success.
  const [session] = useState(() => readPaymentSession(paymentToken));
  const orderId = session?.order_id || null;

  if (!stripePromise) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-4">
        <h1 className="font-heading text-4xl font-extrabold">{t('common.error')}</h1>
        <div role="alert" className="rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="font-semibold">{locale === 'lt' ? 'Klaida' : 'Error'}</div>
          <div className="mt-1 text-sm text-black/70">Missing VITE_STRIPE_PUBLISHABLE_KEY</div>
        </div>
      </main>
    );
  }

  if (!paymentToken || !session?.client_secret) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-4">
        <h1 className="font-heading text-4xl font-extrabold">{t('payment.missingTitle')}</h1>
        <div role="alert" className="rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <div className="font-semibold">{locale === 'lt' ? 'Klaida' : 'Error'}</div>
          <div className="mt-1 text-sm text-black/70">{t('payment.missingBody')}</div>
        </div>
        <a href={paymentPath(locale).replace('/mokejimas', '/krepselis').replace('/payment', '/cart')} className="rounded-full border border-black/20 px-4 py-2 font-semibold inline-flex">
          {t('payment.backToCart')}
        </a>
      </main>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: session.client_secret }}>
      <InnerPayment
        locale={locale}
        orderId={orderId}
        paymentToken={paymentToken}
        clientSecret={session.client_secret}
        totalCents={session.total_cents}
        currency={session.currency || 'eur'}
      />
    </Elements>
  );
}
