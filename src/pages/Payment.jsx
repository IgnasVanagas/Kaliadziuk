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
  const [expressChecked, setExpressChecked] = useState(false);
  // Fallback PaymentRequestButtonElement for browsers (e.g. Edge) where ECE doesn't
  // surface Google Pay / Apple Pay but the browser's native Payment Request API does.
  const [fallbackPR, setFallbackPR] = useState(null);
  const [fallbackWallet, setFallbackWallet] = useState(null);

  // Google Pay direct API detection (fallback #2 for Edge and other Chromium browsers).
  const [googlePayApiReady, setGooglePayApiReady] = useState(false);
  const [googlePayApiChecked, setGooglePayApiChecked] = useState(false);
  const [googlePayClient, setGooglePayClient] = useState(null);

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
    setExpressChecked(true);
    if (!availablePaymentMethods) return;
    setExpressWallets(availablePaymentMethods);
    // Only flag "available" when at least one method is actually usable —
    // this ensures the express section shows for PayPal-only scenarios too
    // (e.g. device has no Google Pay / Apple Pay but PayPal is available).
    const hasMethod = availablePaymentMethods.googlePay
      || availablePaymentMethods.applePay
      || availablePaymentMethods.paypal
      || availablePaymentMethods.revolutPay;
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

  // Set up Payment Request API for Apple Pay (native sheet) and as a fallback
  // for Google Pay on browsers where the direct API doesn't work.
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
      const wallet = result.applePay ? 'applePay' : result.googlePay ? 'googlePay' : null;
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

  // Google Pay API direct detection — works in Chrome, Edge, and other Chromium
  // browsers. Skipped entirely on Apple devices (Safari/iOS) where it isn't
  // supported and can cause blank-page crashes.
  const isAppleDevice = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
  useEffect(() => {
    if (isAppleDevice) { setGooglePayApiChecked(true); return; }
    let cancelled = false;

    const check = async () => {
      try {
        // Load Google Pay JS API if not already present.
        if (!window.google?.payments?.api?.PaymentsClient) {
          await new Promise((resolve, reject) => {
            const existing = document.querySelector('script[src*="pay.google.com/gp/p/js/pay.js"]');
            if (existing) {
              // Script tag exists — wait for the API to become available.
              const wait = setInterval(() => {
                if (window.google?.payments?.api?.PaymentsClient) { clearInterval(wait); resolve(); }
              }, 100);
              setTimeout(() => { clearInterval(wait); reject(new Error('timeout')); }, 8000);
              return;
            }
            const s = document.createElement('script');
            s.src = 'https://pay.google.com/gp/p/js/pay.js';
            s.async = true;
            s.onload = () => {
              // After script load, the API may still need a tick to initialize.
              const wait = setInterval(() => {
                if (window.google?.payments?.api?.PaymentsClient) { clearInterval(wait); resolve(); }
              }, 50);
              setTimeout(() => { clearInterval(wait); reject(new Error('timeout after load')); }, 5000);
            };
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        if (cancelled) return;

        // Use TEST environment on non-production origins so isReadyToPay works during dev.
        const isProd = window.location.hostname === 'kaliadziuk.lt' || window.location.hostname === 'www.kaliadziuk.lt';
        const client = new window.google.payments.api.PaymentsClient({
          environment: isProd ? 'PRODUCTION' : 'TEST',
        });
        const result = await client.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
            },
          }],
        });
        if (cancelled) return;
        if (result.result) {
          // For actual payments, always use PRODUCTION client.
          const prodClient = isProd ? client : new window.google.payments.api.PaymentsClient({ environment: 'PRODUCTION' });
          setGooglePayApiReady(true);
          setGooglePayClient(prodClient);
        }
      } catch (e) {
        console.warn('[GPay] detection failed:', e);
      }
      finally { if (!cancelled) setGooglePayApiChecked(true); }
    };

    check();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        redirect: 'if_required',
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

  // showFallbackWallet: Payment Request API found Apple Pay. This is the primary
  // way to show Apple Pay — avoids needing a second ECE instance which crashes Stripe.
  const showApplePayPR = !!fallbackPR && fallbackWallet === 'applePay';
  // Google Pay via Payment Request API (preferred — Stripe handles merchant registration).
  const showGooglePayPR = !!fallbackPR && fallbackWallet === 'googlePay';

  // Apple Pay detected via Payment Request API (preferred) or ECE detection.
  const hasApplePay = showApplePayPR || !!expressWallets?.applePay;
  // Google Pay detected via ECE (preferred — Stripe handles merchant registration),
  // PR, or direct API (fallback — requires Google Pay Business Console registration).
  const hasGooglePayECE = !!expressWallets?.googlePay;
  const hasGooglePay = hasGooglePayECE || showGooglePayPR || googlePayApiReady;
  // ECE detected PayPal.
  const hasPayPalECE = !!expressWallets?.paypal;

  // Show both wallets when the device supports them.
  const showApplePay = hasApplePay;
  const showGooglePay = hasGooglePay && !isAppleDevice;

  // Show express section when any wallet OR always for Revolut/PayPal buttons.
  const allChecked = expressChecked && googlePayApiChecked;
  const showExpressSection = showGooglePay || showApplePay || hasPayPalECE || allChecked;

  // Manual Revolut Pay attempt via Stripe's redirect-based flow.
  // Revolut Pay is NOT supported by ExpressCheckoutElement, so we create
  // a revolut_pay PaymentMethod and confirm the PaymentIntent with it.
  const tryRevolutPay = async () => {
    if (!stripe || !clientSecret) return;
    setErrorPopup(null);
    setBusy(true);
    markCartToClearAfterSuccess(orderId);
    try {
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'revolut_pay',
      });
      if (pmError) {
        unmarkCartToClearAfterSuccess();
        openErrorPopup(locale === 'lt'
          ? 'Revolut Pay šiuo metu neprieinamas. Bandykite kitą mokėjimo būdą.'
          : 'Revolut Pay is currently unavailable. Please try another payment method.');
        return;
      }
      const { error: confirmError } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          payment_method: paymentMethod.id,
          return_url: returnUrl,
        },
      });
      if (confirmError) {
        unmarkCartToClearAfterSuccess();
        openErrorPopup(locale === 'lt'
          ? 'Revolut Pay šiuo metu neprieinamas. Bandykite kitą mokėjimo būdą.'
          : 'Revolut Pay is currently unavailable. Please try another payment method.');
      }
    } catch {
      unmarkCartToClearAfterSuccess();
      openErrorPopup(locale === 'lt'
        ? 'Revolut Pay šiuo metu neprieinamas. Bandykite kitą mokėjimo būdą.'
        : 'Revolut Pay is currently unavailable. Please try another payment method.');
    } finally {
      setBusy(false);
    }
  };

  // Manual PayPal attempt via Stripe's redirect-based PayPal flow.
  const tryPayPal = async () => {
    if (!stripe || !clientSecret) return;
    setErrorPopup(null);
    setBusy(true);
    markCartToClearAfterSuccess(orderId);
    try {
      const { error } = await stripe.confirmPayPalPayment(clientSecret, {
        return_url: returnUrl,
      });
      if (error) {
        unmarkCartToClearAfterSuccess();
        openErrorPopup(locale === 'lt'
          ? 'PayPal šiuo metu neprieinamas. Bandykite kitą mokėjimo būdą.'
          : 'PayPal is currently unavailable. Please try another payment method.');
      }
    } catch {
      unmarkCartToClearAfterSuccess();
      openErrorPopup(locale === 'lt'
        ? 'PayPal šiuo metu neprieinamas. Bandykite kitą mokėjimo būdą.'
        : 'PayPal is currently unavailable. Please try another payment method.');
    } finally {
      setBusy(false);
    }
  };

  // Google Pay via direct API — for Edge and browsers where ECE/PR don't detect it.
  const tryGooglePayDirect = async () => {
    if (!googlePayClient || !stripe || !clientSecret) return;
    setErrorPopup(null);
    setBusy(true);
    markCartToClearAfterSuccess(orderId);
    try {
      const paymentData = await googlePayClient.loadPaymentData({
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
          merchantName: 'Kaliadziuk',
        },
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              'stripe:version': '2024-06-20',
              'stripe:publishableKey': import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
            },
          },
        }],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: (totalCents / 100).toFixed(2),
          currencyCode: (currency || 'eur').toUpperCase(),
          countryCode: 'LT',
        },
      });

      const token = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: { token: token.id } },
      });
      if (confirmError) {
        unmarkCartToClearAfterSuccess();
        openErrorPopup(confirmError);
        return;
      }
      if (paymentIntent?.status === 'requires_action') {
        const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
        if (actionError) { unmarkCartToClearAfterSuccess(); openErrorPopup(actionError); return; }
      }
      clearPaymentSession(paymentToken);
      window.location.assign(returnUrl);
    } catch (err) {
      unmarkCartToClearAfterSuccess();
      if (err?.statusCode === 'CANCELED') { setBusy(false); return; }
      openErrorPopup(locale === 'lt'
        ? 'Google Pay šiuo metu neprieinamas. Bandykite kitą mokėjimo būdą.'
        : 'Google Pay is currently unavailable. Please try another payment method.');
    } finally {
      setBusy(false);
    }
  };

  // Manual attempt for wallets that were already checked and not found.
  const tryManualWallet = (walletName) => {
    openErrorPopup(locale === 'lt'
      ? `${walletName} neprieinamas šiame įrenginyje. Bandykite kitą mokėjimo būdą.`
      : `${walletName} is not available on this device. Please try another payment method.`);
  };

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
      
      {/* ECE — always mounted for detection. Shows Google Pay natively via
           Stripe (no separate Google Pay merchant registration needed).
           Hidden on Apple devices and when Google Pay not available.
           Apple Pay is handled separately via PaymentRequestButtonElement. */}
      <div className={expressWallets?.googlePay && !isAppleDevice ? '' : 'hidden'}>
        <ExpressCheckoutElement
          onReady={onExpressReady}
          onConfirm={onExpressConfirm}
          options={{
            buttonHeight: 48,
            buttonType: { googlePay: 'buy' },
            buttonTheme: { googlePay: 'black' },
            paymentMethods: { link: 'never', applePay: 'never', googlePay: 'auto', paypal: 'never' },
            paymentMethodOrder: ['googlePay'],
          }}
        />
      </div>

      {showExpressSection && (
        <div className="rounded-2xl border border-black/10 p-5 space-y-3">
          <div className="font-heading font-extrabold">{t('payment.expressTitle')}</div>

          {/* Google Pay via ECE is rendered above this section (always mounted). */}
          {/* Google Pay — fallback via PR (only if ECE didn't detect it) */}
          {showGooglePay && !hasGooglePayECE && showGooglePayPR && (
            <PaymentRequestButtonElement
              options={{
                paymentRequest: fallbackPR,
                style: { paymentRequestButton: { theme: 'dark', height: '48px', type: 'buy' } },
              }}
            />
          )}
          {/* Google Pay — direct API fallback (only if neither ECE nor PR detected it) */}
          {showGooglePay && !hasGooglePayECE && !showGooglePayPR && (
            <button
              type="button"
              disabled={busy}
              onClick={tryGooglePayDirect}
              className="flex items-center justify-center gap-3 w-full rounded-xl bg-black hover:bg-gray-800 px-4 py-3 font-semibold text-white transition-colors disabled:opacity-60"
              style={{ height: 48 }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" fill="currentColor" aria-hidden="true">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
              Google Pay
            </button>
          )}

          {/* Apple Pay — via Payment Request API (native sheet, no second ECE) */}
          {showApplePayPR && (
            <PaymentRequestButtonElement
              options={{
                paymentRequest: fallbackPR,
                style: { paymentRequestButton: { theme: 'dark', height: '48px', type: 'buy' } },
              }}
            />
          )}

          {/* Revolut Pay + PayPal — side by side */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={tryRevolutPay}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#191C1F] hover:bg-[#2a2d31] px-3 py-3 font-semibold text-white transition-colors disabled:opacity-60 text-sm"
              style={{ height: 48 }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="currentColor" aria-hidden="true">
                <path d="M13.74 2C17.73 2 20 4.07 20 7.2c0 2.14-1.26 4.07-3.27 5.12l3.6 7.68h-4.2l-3.12-6.96H9.6V22H5.8V2h7.94zM9.6 5.32v4.4h3.74c1.88 0 3.06-.94 3.06-2.22 0-1.28-1.18-2.18-3.06-2.18H9.6z" />
              </svg>
              Revolut Pay
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={tryPayPal}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#003087] hover:bg-[#002670] px-3 py-3 font-semibold text-white transition-colors disabled:opacity-60 text-sm"
              style={{ height: 48 }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="currentColor" aria-hidden="true">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.5A.764.764 0 0 1 5.7 1.875h6.79c2.256 0 3.861.57 4.76 1.692.39.487.637 1.023.753 1.65.12.651.102 1.426-.06 2.365l-.013.072v.635l.495.283a3.52 3.52 0 0 1 1.007.732c.375.433.624.988.74 1.648.12.681.104 1.495-.05 2.42-.176 1.06-.46 1.984-.844 2.746a5.61 5.61 0 0 1-1.336 1.73 5.07 5.07 0 0 1-1.897 1.008 8.4 8.4 0 0 1-2.38.316h-.564a1.7 1.7 0 0 0-1.682 1.434l-.043.218-.718 4.546-.033.148a.14.14 0 0 1-.044.094.133.133 0 0 1-.086.032z" />
              </svg>
              PayPal
            </button>
          </div>

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
        </div>
      )}

      <div className="rounded-2xl border border-black/10 p-5 space-y-4">
        <div className="font-heading font-extrabold">{t('payment.cardTitle')}</div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <PaymentElement options={{
            layout: 'tabs',
            wallets: { applePay: 'never', googlePay: 'never' },
            paymentMethodOrder: ['card'],
          }} />
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
