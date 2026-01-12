import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocaleFromPathname, persistLocale } from '../lib/locale';

function withLocalePath(pathname, locale) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  const rest = (parts[0] === 'lt' || parts[0] === 'en') ? parts.slice(1) : parts;
  return `/${locale}/${rest.join('/')}`.replace(/\/$/, '') || `/${locale}`;
}

export default function LocaleNav() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = getLocaleFromPathname(location.pathname) || i18n.language;

  const switchTo = (next) => {
    persistLocale(next);
    i18n.changeLanguage(next);
    navigate(withLocalePath(location.pathname, next) + location.search + location.hash, { replace: true });
  };

  const base = `/${locale}`;

  return (
    <header className="sticky top-0 z-[9996] bg-white/80 backdrop-blur border-b border-black/10">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link to={`${base}`}>{t('nav.home')}</Link>
          <Link to={`${base}/${locale === 'lt' ? 'planai' : 'plans'}`}>{t('nav.plans')}</Link>
          <Link to={`${base}/${locale === 'lt' ? 'dovanu-kuponas' : 'gift-card'}`}>{t('nav.giftCard')}</Link>
          <Link to={`${base}/${locale === 'lt' ? 'krepselis' : 'cart'}`}>{t('nav.cart')}</Link>
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-black/60">{t('common.language')}:</span>
          <button
            type="button"
            onClick={() => switchTo('lt')}
            className={`px-2 py-1 rounded-full border ${locale === 'lt' ? 'bg-black text-white border-black' : 'border-black/20'}`}
          >
            {t('common.lt')}
          </button>
          <button
            type="button"
            onClick={() => switchTo('en')}
            className={`px-2 py-1 rounded-full border ${locale === 'en' ? 'bg-black text-white border-black' : 'border-black/20'}`}
          >
            {t('common.en')}
          </button>
        </div>
      </div>
    </header>
  );
}
