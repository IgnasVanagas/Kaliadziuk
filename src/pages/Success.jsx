import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { clearCart, saveCart } from '../state/cart';
import { sendEvent } from '../lib/tracking';

const CLEAR_CART_FLAG_KEY = 'clear_cart_after_success_v1';

export default function Success() {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = location.pathname.startsWith('/en') ? 'en' : 'lt';
  const homeHref = locale === 'en' ? '/en' : '/lt';

  useEffect(() => {
    try {
      const pendingRaw = sessionStorage.getItem('analytics_purchase_pending');
      if (pendingRaw) {
        const data = JSON.parse(pendingRaw);
        sendEvent('purchase', {
          transaction_id: new Date().getTime().toString(), // Fallback ID if real Order ID is not available in frontend yet
          currency: data.currency || 'EUR',
          value: data.value || 0,
          items: data.items || [],
        });
        sessionStorage.removeItem('analytics_purchase_pending');
      }

      const shouldClear = sessionStorage.getItem(CLEAR_CART_FLAG_KEY);
      if (!shouldClear) return;
      
      saveCart(clearCart());
      sessionStorage.removeItem(CLEAR_CART_FLAG_KEY);
      // Payment succeeded — remove the checkout contact draft so it doesn't
      // pre-fill a future checkout session with stale data.
      try {
        for (const key of ['checkout_draft_lt', 'checkout_draft_en']) {
          sessionStorage.removeItem(key);
        }
      } catch { /* ignore */ }
    } catch {
      // ignore
    }
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-4">
      <h1 className="font-heading text-4xl font-extrabold">{t('success.title')}</h1>
      <p className="text-black/70">{t('success.body')}</p>

      <div className="pt-2">
        <a
          href={homeHref}
          className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 font-extrabold text-black transition-transform duration-150 hover:-translate-y-0.5"
        >
          {t('success.backHome')}
        </a>
      </div>
    </main>
  );
}
