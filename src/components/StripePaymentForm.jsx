import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function StripePaymentForm({ locale, returnUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

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
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || t('cart.payment.failed'));
        return;
      }

      // If Stripe didn't redirect (no 3DS), we still send users to success.
      window.location.assign(returnUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-black/10 p-5 space-y-4">
      <div className="font-heading font-extrabold">{t('cart.payment.title')}</div>

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
        className="w-full rounded-full border border-black/20 px-4 py-3 font-semibold disabled:opacity-60"
        aria-busy={busy ? 'true' : 'false'}
      >
        {busy ? t('cart.payment.processing') : t('cart.payment.pay')}
      </button>

      <p className="text-xs text-black/60">
        {t('cart.checkoutNote')}
      </p>

      {/* Keep locale prop referenced so it’s explicit and future-proof */}
      <span className="sr-only">{locale}</span>
    </div>
  );
}
