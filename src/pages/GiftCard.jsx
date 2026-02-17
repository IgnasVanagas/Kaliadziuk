import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { addItem, loadCart, saveCart } from '../state/cart';

const fromUploads = (file) => new URL(`../../uploads/${file}`, import.meta.url).pathname;
const contactImage = fromUploads('IMG_0488-scaled.jpg');

export default function GiftCard() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = useMemo(() => (location.pathname.startsWith('/en') ? 'en' : 'lt'), [location.pathname]);

  const [amount, setAmount] = useState('200');
  const [recipientName, setRecipientName] = useState('');
  const [errorPopup, setErrorPopup] = useState(null);

  const base = `/${locale}`;

  const onAdd = () => {
    const amountVal = amount.replace(',', '.');
    // Allow empty during typing, but validate on submit
    if (!amountVal) {
      setErrorPopup({
        title: locale === 'lt' ? 'Klaida' : 'Error',
        message: locale === 'lt' ? 'Įveskite sumą' : 'Enter amount'
      });
      return;
    }

    const amountEur = Number(amountVal);
    const amountCents = Math.round(amountEur * 100);

    // Validate number and minimum amount (50 EUR)
    if (!Number.isFinite(amountCents) || amountCents < 5000) {
      setErrorPopup({
        title: locale === 'lt' ? 'Klaida' : 'Error',
        message: locale === 'lt' ? 'Minimali suma: 50 EUR' : 'Minimum amount: 50 EUR'
      });
      return;
    }

    if (!recipientName) {
      setErrorPopup({
        title: locale === 'lt' ? 'Klaida' : 'Error',
        message: locale === 'lt' ? 'Užpildykite visus laukus' : 'Please fill all fields'
      });
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
        // Buyer details collected at checkout
        buyerName: '',
        buyerEmail: '',
      },
    });
    saveCart(next);
    navigate(`${base}/${locale === 'lt' ? 'krepselis' : 'cart'}`);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    // Allow numbers only
    if (/^\d*$/.test(val)) {
      setAmount(val);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-6 py-16 text-white overflow-hidden">
        {/* Background */}
        <picture className="pointer-events-none absolute inset-0 z-0">
          <img
            src={contactImage}
            alt=""
            className="h-full w-full object-cover object-[center_50%] md:object-[center_65%]"
          />
        </picture>
        
        {/* Overlays */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/40" aria-hidden="true" />

      <div className="relative z-20 w-full max-w-md space-y-8">
        <h1 className="text-center font-heading text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow-md">
          {t('giftCard.title')}
        </h1>

        <div className="rounded-[2.5rem] bg-white/95 backdrop-blur-sm p-8 shadow-2xl ring-1 ring-white/20 sm:p-10 text-black">
          <div className="space-y-6">
            <label className="block space-y-2">
              <span className="text-sm font-bold uppercase tracking-wider text-black/60">{t('giftCard.amount')}</span>
              <div className="relative">
                <input
                  className="w-full rounded-2xl border-0 bg-slate-50 px-6 py-4 text-lg font-bold text-slate-900 shadow-inner ring-1 ring-black/5 transition focus:bg-white focus:ring-2 focus:ring-black placeholder:text-slate-400 outline-none"
                  value={amount}
                  onChange={handleAmountChange}
                  inputMode="numeric"
                  placeholder="200"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold uppercase tracking-wider text-black/60">{t('giftCard.recipientName')}</span>
              <input
                className="w-full rounded-2xl border-0 bg-slate-50 px-6 py-4 text-base font-medium text-slate-900 shadow-inner ring-1 ring-black/5 transition focus:bg-white focus:ring-2 focus:ring-black placeholder:text-slate-400 outline-none"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder={locale === 'lt' ? 'Vardas Pavardė' : 'Full Name'}
              />
            </label>

            <button
              type="button"
              onClick={onAdd}
              className="mt-4 flex w-full items-center justify-center rounded-full glass-green-surface py-4 text-xl font-extrabold text-black transition hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('giftCard.addToCart')}
            </button>
          </div>
        </div>
      </div>

      {/* Error / Validation Popup */}
      {errorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 relative scale-100 animate-in zoom-in-95 duration-200 border-l-4 border-red-500">
            <button 
              onClick={() => setErrorPopup(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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
              
              <h3 className="text-xl font-bold text-gray-900">
                {errorPopup.title}
              </h3>
              
              <p className="text-gray-600 whitespace-pre-line">
                {errorPopup.message}
              </p>
              
              <button
                onClick={() => setErrorPopup(null)}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all transform active:scale-95"
              >
                {locale === 'lt' ? 'Supratau' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
