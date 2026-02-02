import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { addItem, loadCart, saveCart } from '../state/cart';

export default function GiftCard() {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const [amount, setAmount] = useState('50');
  const [recipientName, setRecipientName] = useState('');
  const [error, setError] = useState(null);

  const heroImage = useMemo(() => new URL(`../../uploads/IMG_0488-scaled.jpg`, import.meta.url).pathname, []);

  useEffect(() => {
    const scrollY = window.scrollY || 0;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyLeft = document.body.style.left;
    const prevBodyRight = document.body.style.right;
    const prevBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.left = prevBodyLeft;
      document.body.style.right = prevBodyRight;
      document.body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const onAdd = () => {
    setError(null);
    const amountEur = Number(String(amount).replace(',', '.'));
    const amountCents = Math.round(amountEur * 100);
    if (!Number.isFinite(amountCents) || amountCents < 5000) {
      setError(locale === 'lt' ? 'Minimali suma: 50 EUR' : 'Minimum amount: 50 EUR');
      return;
    }

    const cart = loadCart();
    const next = addItem(cart, {
      kind: 'gift_card',
      productId: null,
      name: locale === 'lt' ? 'Dovanų kuponas' : 'Gift card',
      unitPriceCents: amountCents,
      amountCents,
      qty: 1,
      meta: {
        recipientName,
      },
    });
    saveCart(next);
    try {
      window.dispatchEvent(new Event('cart:open'));
    } catch {
      // ignore
    }
  };

  return (
    <main className="h-[100svh] overflow-hidden bg-white text-black">
      <section className="relative h-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        <div className="relative mx-auto flex h-full max-w-4xl items-center px-6 pb-8 pt-24 box-border sm:pt-28">
        <div className="w-full rounded-[32px] border border-white/15 bg-white/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur sm:p-7">
          <div className="grid gap-3">
            {error ? (
              <div role="alert" className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm">
                <div className="font-semibold">{locale === 'lt' ? 'Klaida' : 'Error'}</div>
                <div className="mt-1 text-black/70">{error}</div>
              </div>
            ) : null}
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('giftCard.amount')}</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                value={amount}
                onChange={e => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                inputMode="decimal"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('giftCard.recipientName')}</span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-black placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
              />
            </label>

            <button
              type="button"
              onClick={onAdd}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full glass-green-surface px-6 py-3 text-base font-extrabold text-black transition-transform duration-150 hover:-translate-y-0.5"
            >
              {t('giftCard.addToCart')}
            </button>
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}
