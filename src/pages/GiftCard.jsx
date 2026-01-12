import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { addItem, loadCart, saveCart } from '../state/cart';

export default function GiftCard() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const [amount, setAmount] = useState('50');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  const base = `/${locale}`;

  const onAdd = () => {
    const amountEur = Number(String(amount).replace(',', '.'));
    const amountCents = Math.round(amountEur * 100);
    if (!Number.isFinite(amountCents) || amountCents < 1000) {
      alert('Min: 10 EUR');
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
        recipientEmail,
        buyerName,
        buyerEmail,
      },
    });
    saveCart(next);
    navigate(`${base}/${locale === 'lt' ? 'krepselis' : 'cart'}`);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl font-extrabold">{t('giftCard.title')}</h1>
        <Link to={`${base}/${locale === 'lt' ? 'krepselis' : 'cart'}`} className="underline">
          {t('nav.cart')}
        </Link>
      </div>

      <div className="rounded-2xl border border-black/10 p-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">{t('giftCard.amount')}</span>
          <input
            className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">{t('giftCard.recipientName')}</span>
            <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">{t('giftCard.recipientEmail')}</span>
            <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} type="email" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">{t('giftCard.buyerName')}</span>
            <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">{t('giftCard.buyerEmail')}</span>
            <input className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} type="email" />
          </label>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center rounded-full glass-green-surface px-5 py-2 text-base font-extrabold text-black"
        >
          {t('giftCard.addToCart')}
        </button>
      </div>
    </main>
  );
}
