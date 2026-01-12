import { Elements, PaymentElement, PaymentRequestButtonElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

function readPaymentSession(orderId) {
  if (!orderId) return null;
  try {
    const raw = sessionStorage.getItem(`payment_intent_${orderId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearPaymentSession(orderId) {
  if (!orderId) return;
  try {
    sessionStorage.removeItem(`payment_intent_${orderId}`);
  } catch {
    // ignore
  }
}

function InnerPayment({ locale, orderId, clientSecret, totalCents, currency }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canPay, setCanPay] = useState(null);

  const returnUrl = `${window.location.origin}${successPath(locale)}`;

  useEffect(() => {
    if (!stripe || !clientSecret || !totalCents) return;

    const pr = stripe.paymentRequest({
      country: 'LT',
      currency: (currency || 'eur').toLowerCase(),
      total: {
        label: t('payment.totalLabel'),
        amount: Number(totalCents || 0),
      },
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      setCanPay(result);
      if (result) setPaymentRequest(pr);
    });

    pr.on('paymentmethod', async (ev) => {
      setError(null);
      setBusy(true);
      try {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete('fail');
          setError(confirmError.message || t('cart.payment.failed'));
          return;
        }

        ev.complete('success');

        if (paymentIntent && paymentIntent.status === 'requires_action') {
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
          if (actionError) {
            setError(actionError.message || t('cart.payment.failed'));
            return;
          }
        }

        clearPaymentSession(orderId);
        window.location.assign(returnUrl);
      } finally {
        setBusy(false);
      }
    });

    return () => {
      // no-op
    };
  }, [stripe, clientSecret, totalCents, currency, t, returnUrl, orderId]);

  const onPay = async () => {
    setError(null);

    if (!stripe || !elements) {
      setError(t('cart.payment.notReady'));
      return;
    }

    setBusy(true);
    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
      });

      if (confirmError) {
        setError(confirmError.message || t('cart.payment.failed'));
        return;
      }

      clearPaymentSession(orderId);
      window.location.assign(returnUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-extrabold">{t('payment.title')}</h1>
        <p className="text-black/70">{t('payment.subtitle')}</p>
      </div>

      {paymentRequest ? (
        <div className="rounded-2xl border border-black/10 p-5 space-y-3">
          <div className="font-heading font-extrabold">{t('payment.expressTitle')}</div>
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <PaymentRequestButtonElement options={{ paymentRequest }} />
          </div>
          {canPay && (canPay.applePay || canPay.googlePay) ? (
            <p className="text-xs text-black/60">
              {canPay.applePay ? t('payment.applePayHint') : null}
              {canPay.googlePay ? t('payment.googlePayHint') : null}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-black/10 p-5 space-y-4">
        <div className="font-heading font-extrabold">{t('payment.cardTitle')}</div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

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

        <p className="text-xs text-black/60">{t('cart.checkoutNote')}</p>
      </div>
    </main>
  );
}

export default function Payment() {
  const { t } = useTranslation();
  const location = useLocation();

  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderId = params.get('order_id');

  const session = useMemo(() => readPaymentSession(orderId), [orderId]);

  if (!stripePromise) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-4">
        <h1 className="font-heading text-4xl font-extrabold">{t('common.error')}</h1>
        <p className="text-black/70">Missing VITE_STRIPE_PUBLISHABLE_KEY</p>
      </main>
    );
  }

  if (!orderId || !session?.client_secret) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-4">
        <h1 className="font-heading text-4xl font-extrabold">{t('payment.missingTitle')}</h1>
        <p className="text-black/70">{t('payment.missingBody')}</p>
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
        clientSecret={session.client_secret}
        totalCents={session.total_cents}
        currency={session.currency || 'eur'}
      />
    </Elements>
  );
}
