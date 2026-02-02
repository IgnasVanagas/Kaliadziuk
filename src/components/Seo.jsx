import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

function fromUploads(file) {
  return new URL(`../../uploads/${file}`, import.meta.url).pathname;
}

function getSiteOrigin() {
  const envOrigin = String(
    import.meta.env.VITE_SITE_URL || import.meta.env.VITE_PUBLIC_SITE_URL || ''
  ).trim();

  const runtimeOrigin = typeof window !== 'undefined' ? String(window.location.origin || '') : '';
  const candidate = envOrigin || runtimeOrigin;

  // Avoid baking localhost into canonical/og URLs (important for prerender).
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(candidate)) {
    return 'https://kaliadziuk.lt';
  }

  return candidate || 'https://kaliadziuk.lt';
}

function joinUrl(origin, path) {
  const base = String(origin || '').replace(/\/+$/, '');
  const p = String(path || '').startsWith('/') ? String(path || '') : `/${path || ''}`;
  return base ? `${base}${p}` : p;
}

function toEnglishPath(pathname) {
  if (!pathname) return '/en';
  if (pathname === '/lt') return '/en';
  return pathname.replace(/^\/lt\b/, '/en');
}

function toLithuanianPath(pathname) {
  if (!pathname) return '/lt';
  if (pathname === '/en') return '/lt';
  return pathname.replace(/^\/en\b/, '/lt');
}

function seoForRoute(locale, pathname) {
  const isEn = locale === 'en';

  // Defaults (home)
  let title = isEn
    ? 'Personal trainer in Vilnius – Pavel Kaliadziuk | Fat loss & muscle gain'
    : 'Asmeninis treneris Vilniuje – Pavel Kaliadziuk | Raumenų auginimas, svorio metimas';

  let description = isEn
    ? 'Personal trainer in Vilnius. Pavel Kaliadziuk helps with muscle gain, fat loss, and pain-free training through personal sessions and online plans.'
    : 'Asmeninis treneris Vilniuje. Pavel Kaliadziuk padeda raumenų auginimui, svorio metimui ir judėjimui be skausmo per asmenines treniruotes ir online planus.';

  let robots = 'index,follow';

  // Route-specific overrides
  if (/^\/(lt\/planai|en\/plans)\b/.test(pathname)) {
    title = isEn
      ? 'Training plans | Personal trainer in Vilnius – Pavel Kaliadziuk'
      : 'Treniruočių planai | Asmeninis treneris Vilniuje – Pavel Kaliadziuk';
    description = isEn
      ? 'Choose a training plan for fat loss or muscle gain. Clear structure, feedback, and progress tracking.'
      : 'Pasirinkite treniruočių planą svorio metimui ar raumenų auginimui. Aiški struktūra, grįžtamasis ryšys ir progreso stebėjimas.';
  }

  if (/^\/(lt\/dovanu-kuponas|en\/gift-card)\b/.test(pathname)) {
    title = isEn
      ? 'Gift voucher | Pavel Kaliadziuk'
      : 'Dovanų kuponas | Pavel Kaliadziuk';
    description = isEn
      ? 'Gift a personal training experience or a plan. Choose an amount and we’ll tailor the first steps.'
      : 'Padovanokite asmeninę treniruotę ar planą. Pasirinkite sumą, o pirmus žingsnius suderinsime asmeniškai.';
  }

  // Keep transactional pages out of search results.
  if (/^\/(lt\/krepselis|en\/cart|lt\/mokejimas|en\/payment|lt\/sekme|en\/success|lt\/atsaukta|en\/cancel)\b/.test(pathname)) {
    robots = 'noindex,nofollow';
  }

  // Auth/admin/account also noindex.
  if (/^\/(lt\/prisijungti|en\/login|lt\/paskyra|en\/account|lt\/admin|en\/admin)\b/.test(pathname)) {
    robots = 'noindex,nofollow';
  }

  return { title, description, robots };
}

export default function Seo({ locale }) {
  const { pathname } = useLocation();
  const origin = getSiteOrigin();

  const effectiveLocale = locale === 'en' ? 'en' : 'lt';
  const { title, description, robots } = seoForRoute(effectiveLocale, pathname);

  const canonical = joinUrl(origin, pathname);
  const ltUrl = joinUrl(origin, toLithuanianPath(pathname));
  const enUrl = joinUrl(origin, toEnglishPath(pathname));

  const ogImage = joinUrl(origin, fromUploads('Branding/Žalias-full-TP-RGB.png'));

  const jsonLd = pathname === '/lt' || pathname === '/en'
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'Coach Kaliadziuk',
            url: joinUrl(origin, effectiveLocale === 'en' ? '/en' : '/lt'),
            inLanguage: effectiveLocale,
          },
          {
            '@type': 'Person',
            name: 'Pavel Kaliadziuk',
            jobTitle: effectiveLocale === 'en' ? 'Personal trainer' : 'Asmeninis treneris',
            url: joinUrl(origin, effectiveLocale === 'en' ? '/en' : '/lt'),
            areaServed: {
              '@type': 'City',
              name: 'Vilnius',
            },
            knowsAbout: effectiveLocale === 'en'
              ? ['Muscle gain', 'Fat loss', 'Strength training', 'Mobility']
              : ['Raumenų auginimas', 'Svorio metimas', 'Jėgos treniruotės', 'Mobilumas'],
          },
        ],
      }
    : null;

  return (
    <Helmet>
      <html lang={effectiveLocale} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <link rel="alternate" hrefLang="lt" href={ltUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={ltUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Coach Kaliadziuk" />
      <meta property="og:locale" content={effectiveLocale === 'en' ? 'en_US' : 'lt_LT'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}
