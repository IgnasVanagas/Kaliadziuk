import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { computeSubtotalCents, computeTotalCents, loadCart, removeItem, saveCart } from '../state/cart';
import { formatEurFromCents } from '../lib/money';
import { sendEvent } from '../lib/tracking';

function getLocale(pathname) {
  return pathname.startsWith('/en') ? 'en' : 'lt';
}

export default function CartDrawer({ open, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = useMemo(() => getLocale(location.pathname), [location.pathname]);

  const [cart, setCart] = useState(() => loadCart());

  useEffect(() => {
    const sync = () => setCart(loadCart());
    if (open) {
      sync();
      
      const c = loadCart();
      const val = computeTotalCents(c);
      sendEvent('view_cart', {
        currency: 'EUR',
        value: val / 100,
        items: (c.items || []).map((it) => ({
          item_id: it.productId || 'gift_card',
          item_name: it.name,
          price: (it.unitPriceCents || 0) / 100,
          quantity: it.qty || 1,
        })),
      });
    }

    window.addEventListener('cart:updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('cart:updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

  const subtotal = computeSubtotalCents(cart);
  const total = computeTotalCents(cart);

  const cartPath = locale === 'lt' ? '/lt/krepselis' : '/en/cart';

  const onRemove = (index) => {
    const next = removeItem(loadCart(), index);
    saveCart(next);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('cartDrawer.close')}
        onClick={() => onClose?.()}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title')}
        className="absolute right-0 top-0 h-full w-[min(420px,92vw)] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
            <div>
              <div className="font-heading text-2xl font-extrabold">{t('cart.title')}</div>
              <div className="text-sm text-black/60">{t('cartDrawer.subtitle')}</div>
            </div>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
              aria-label={t('cartDrawer.close')}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5">
            {cart.items?.length ? (
              <div className="space-y-4">
                {cart.items.map((it, idx) => (
                  <div key={`${it.kind}-${it.productId ?? 'na'}-${idx}`} className="flex gap-4 rounded-2xl border border-black/10 p-4">
                    {it.imageUrl ? (
                      <img src={it.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-black/5" aria-hidden="true" />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{it.name}</div>
                          <div className="text-sm text-black/60">
                            {t('cartDrawer.qty')}: {Number(it.qty || 1)}
                          </div>
                        </div>
                        <div className="shrink-0 font-heading font-extrabold">{formatEurFromCents((it.unitPriceCents || 0) * (it.qty || 1))}</div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => onRemove(idx)}
                          className="text-sm font-semibold text-black/70 hover:text-black"
                        >
                          {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-black/70">
                {t('cart.empty')}
              </div>
            )}
          </div>

          <div className="border-t border-black/10 px-6 py-5 space-y-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{formatEurFromCents(subtotal)}</span></div>
              <div className="flex justify-between"><span>{t('cart.total')}</span><span className="font-heading font-extrabold">{formatEurFromCents(total)}</span></div>
            </div>

            <div className="grid gap-3">
              <Link
                to={cartPath}
                onClick={() => onClose?.()}
                className={`inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 text-base font-extrabold text-black ${!cart.items?.length ? 'pointer-events-none opacity-60' : ''}`}
              >
                {t('cartDrawer.goToPayment')}
              </Link>

              <button
                type="button"
                onClick={() => onClose?.()}
                className="inline-flex items-center justify-center rounded-full border border-black/20 bg-white px-6 py-3 text-base font-semibold text-black"
              >
                {t('cartDrawer.continue')}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
