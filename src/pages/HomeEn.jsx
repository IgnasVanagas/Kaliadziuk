import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export default function HomeEn() {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = location.pathname.startsWith('/en') ? 'en' : 'en';

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 space-y-8">
      <h1 className="font-heading text-4xl font-extrabold">{t('home.title')}</h1>
      <p className="text-black/70">
        Buy training and nutrition plans via cart + Stripe Checkout. Gift cards supported.
      </p>

      <div className="flex gap-3">
        <Link
          to={`/${locale}/plans`}
          className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 text-lg font-extrabold text-black"
        >
          {t('home.ctaPlans')}
        </Link>
        <Link
          to={`/${locale}/gift-card`}
          className="inline-flex items-center justify-center rounded-full border border-black/20 px-6 py-3 text-lg font-extrabold"
        >
          {t('home.ctaGift')}
        </Link>
      </div>
    </main>
  );
}
