import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { sendEvent } from '../lib/tracking';

export default function StripePaymentForm({ locale, returnUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Track that user sees the payment form
  useEffect(() => {
    // We can assume if this component mounts, the payment info step has started/is visible
    // "add_payment_info" typically means "user successfully submitted payment info" OR "user entered the payment flow".
    // GA4 docs say: "when a user submits their payment information".
    // However, since we don't control the submit button here (we do, but it's stripe elements), 
    // let's fire it when they click Pay, or broadly when this component functions.
    // Actually, let's fire it when they click Pay (onPay).
  }, []);

  const onPay = async () => {
    setError(null);

    if (!stripe || !elements) {
      setError(t('cart.payment.notReady'));
      return;
    }

    sendEvent('add_payment_info', {
      payment_type: 'stripe',
      currency: 'EUR',
      // We don't have total value easily here without props, but it's optional for this event usually
      // unless we pass it down. 
      // Checking `StripePaymentForm` usages would clarify if we can pass `value`.
    });

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

      {/* Keep locale prop referenced so it’s explicit and future-proof */}
      <span className="sr-only">{locale}</span>
    </div>
  );
}
