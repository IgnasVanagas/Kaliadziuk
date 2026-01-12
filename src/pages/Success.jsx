import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export default function Success() {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = location.pathname.startsWith('/en') ? 'en' : 'lt';
  const homeHref = locale === 'en' ? '/en' : '/lt';
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
