import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocaleFromPathname } from '../lib/locale';

export default function NotFound() {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) || 'lt';
  const homeHref = locale === 'en' ? '/en' : '/lt';

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-4">
      <h1 className="font-heading text-4xl font-extrabold uppercase">{t('notFound.title')}</h1>
      <p className="text-black/70">{t('notFound.body')}</p>

      <div className="pt-2">
        <a
          href={homeHref}
          className="inline-flex items-center justify-center rounded-full glass-green-surface px-6 py-3 font-extrabold text-black transition-transform duration-150 hover:-translate-y-0.5"
        >
          {t('notFound.backHome')}
        </a>
      </div>
    </main>
  );
}
