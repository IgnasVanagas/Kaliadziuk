import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadCart } from '../state/cart';
import CartDrawer from './CartDrawer.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';

// Use `.pathname` (not `.href`) so prerendered HTML doesn't bake in localhost origins.
const fromUploads = (file) => `/uploads/${String(file || '').replace(/^\/+/, '')}`;
const logoUrl = fromUploads('Branding/Pozityvi-full-TP-RGB.png');
const logoSrcSetWebp = [
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-320w.webp')} 320w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-480w.webp')} 480w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-640w.webp')} 640w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-768w.webp')} 768w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-960w.webp')} 960w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-1024w.webp')} 1024w`,
].join(', ');
const logoSrcSetAvif = [
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-320w.avif')} 320w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-480w.avif')} 480w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-640w.avif')} 640w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-768w.avif')} 768w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-960w.avif')} 960w`,
  `${fromUploads('_optimized/Branding/Pozityvi-full-TP-RGB-1024w.avif')} 1024w`,
].join(', ');

function getLocale(pathname) {
  return pathname.startsWith('/en') ? 'en' : 'lt';
}

function swapLocalePath(pathname, nextLocale) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  const currentLocale = parts[0] === 'en' ? 'en' : 'lt';
  const rest = parts[0] === 'lt' || parts[0] === 'en' ? parts.slice(1) : parts;

  const mapping = {
    lt: {
      planai: 'plans',
      'svorio-metimo-programa': 'weight-loss-program',
      'dovanu-kuponas': 'gift-card',
      krepselis: 'cart',
      prisijungti: 'login',
      paskyra: 'account',
      privatumas: 'privacy',
      taisykles: 'terms',
      grazinimas: 'refunds',
      sekme: 'success',
      atsaukta: 'cancel',
      anketa: 'questionnaire',
    },
    en: {
      plans: 'planai',
      'weight-loss-program': 'svorio-metimo-programa',
      'gift-card': 'dovanu-kuponas',
      cart: 'krepselis',
      login: 'prisijungti',
      account: 'paskyra',
      privacy: 'privatumas',
      terms: 'taisykles',
      refunds: 'grazinimas',
      success: 'sekme',
      cancel: 'atsaukta',
      questionnaire: 'anketa',
    },
  };

  const mappedFirst = rest.length ? (mapping[currentLocale]?.[rest[0]] || rest[0]) : '';
  const nextRest = rest.length ? [mappedFirst, ...rest.slice(1)] : [];

  const newPath = `/${nextLocale}/${nextRest.join('/')}`;
  // Ensure trailing slash if it's not the root (though /en/ and /lt/ are roots for those locales)
  return newPath.endsWith('/') ? newPath : `${newPath}/`;
}

export default function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(() => {
    const cart = loadCart();
    return (cart.items || []).reduce((sum, it) => sum + Number(it.qty || 1), 0);
  });

  const locale = useMemo(() => getLocale(location.pathname), [location.pathname]);
  const homeBase = `/${locale}/`;

  const navItems = useMemo(() => {
    if (locale === 'en') {
      return [
        { label: 'Plans', href: `${homeBase}#programos` },
        { label: 'Services', href: `${homeBase}#paslaugos` },
        { label: 'Stories', href: `${homeBase}#sekmes` },
        { label: 'Contacts', href: `${homeBase}#kontaktai` },
      ];
    }
    return [
      { label: 'Planai', href: `${homeBase}#programos` },
      { label: 'Paslaugos', href: `${homeBase}#paslaugos` },
      { label: 'Istorijos', href: `${homeBase}#sekmes` },
      { label: 'Kontaktai', href: `${homeBase}#kontaktai` },
    ];
  }, [homeBase, locale]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const recompute = () => {
      const cart = loadCart();
      setCartCount((cart.items || []).reduce((sum, it) => sum + Number(it.qty || 1), 0));
    };
    recompute();

    const onCartOpen = () => setDrawerOpen(true);

    const onStorage = (e) => {
      if (!e || e.key === null || e.key === 'cart_v1') {
        recompute();
      }
    };

    window.addEventListener('cart:updated', recompute);
    window.addEventListener('cart:open', onCartOpen);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cart:updated', recompute);
      window.removeEventListener('cart:open', onCartOpen);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-transform duration-700 ${
    scrolled ? 'translate-y-4' : 'translate-y-0'
  }`;
  const headerSurfaceClass = `w-full px-6 transition-all duration-700 backdrop-saturate-150 ${
    scrolled
      ? 'mx-auto max-w-6xl !rounded-[2rem] border border-white/30 glass-green py-3 text-black shadow-[0_35px_90px_rgba(0,0,0,0.35)]'
      : 'mx-auto max-w-full rounded-none border-b border-black/10 bg-white py-5 text-black shadow-[0_12px_45px_rgba(15,23,42,0.08)]'
  }`;
  const desktopLinkClass = 'transition text-black hover:text-slate-900';
  const desktopCtaClass = 'inline-flex items-center justify-center rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-900';
  const mobileMenuBaseClass = 'border border-black/15 bg-white/95 text-black backdrop-blur-md rounded-3xl mt-4';
  const mobileLinkClass = 'transition text-black hover:text-accent';
  const mobileCtaClass = 'mt-6 inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900';
  const mobileToggleClass = 'inline-flex items-center justify-center rounded-full border border-black/40 p-2 text-black md:hidden';

  const cartPath = locale === 'lt' ? '/lt/krepselis/' : '/en/cart/';
  const accountPath = locale === 'lt' ? '/lt/paskyra/' : '/en/account/';
  const loginPath = locale === 'lt' ? '/lt/prisijungti/' : '/en/login/';

  const switchTo = (nextLocale) => {
    try {
      localStorage.setItem('locale', nextLocale);
    } catch {
      // ignore
    }
    navigate(swapLocalePath(location.pathname, nextLocale) + location.search + location.hash, { replace: true });
  };

  return (
    <>
    <header className={headerClass}>
      <div className={headerSurfaceClass}>
        <div className={`flex items-center justify-between w-full ${!scrolled ? 'max-w-7xl mx-auto' : ''}`}>
          <a href={`${homeBase}#hero`} className="transition-opacity duration-300 hover:opacity-80">
            <picture>
              <source type="image/avif" srcSet={logoSrcSetAvif} sizes="(min-width: 768px) 240px, 180px" />
              <source type="image/webp" srcSet={logoSrcSetWebp} sizes="(min-width: 768px) 240px, 180px" />
              <img
                src={logoUrl}
                alt="Kaliadziuk"
                className={`w-auto object-contain transition-all duration-700 ${scrolled ? 'h-10' : 'h-14'}`}
                decoding="async"
                width={3223}
                height={677}
              />
            </picture>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className={desktopLinkClass}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={user ? accountPath : loginPath}
              className="relative inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/20"
              aria-label={user ? (locale === 'lt' ? 'Paskyra' : 'Account') : (locale === 'lt' ? 'Prisijungti' : 'Sign in')}
            >
              <span className="sr-only">
                {user ? (locale === 'lt' ? 'Paskyra' : 'Account') : (locale === 'lt' ? 'Prisijungti' : 'Sign in')}
              </span>
              <svg className="block h-5 w-5 translate-y-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>

            <a
              href={cartPath}
              className="relative inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/20"
              aria-label={locale === 'lt' ? 'Krepšelis' : 'Cart'}
            >
              <span className="sr-only">{locale === 'lt' ? 'Krepšelis' : 'Cart'}</span>
              <svg className="block h-5 w-5 translate-y-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-12z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l-2-2H2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 ? (
                <span
                  className="pointer-events-none !absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full glass-green-surface px-1 text-[11px] font-extrabold leading-none text-black"
                  aria-label={locale === 'lt' ? `Krepšelyje: ${cartCount}` : `Cart items: ${cartCount}`}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              ) : null}
            </a>

            <div className="flex items-center gap-1 rounded-full border border-black/20 p-1">
              <button type="button" onClick={() => switchTo('lt')} className={`px-2 py-1 rounded-full text-xs font-semibold ${locale === 'lt' ? 'bg-black text-white' : ''}`}>LT</button>
              <button type="button" onClick={() => switchTo('en')} className={`px-2 py-1 rounded-full text-xs font-semibold ${locale === 'en' ? 'bg-black text-white' : ''}`}>EN</button>
            </div>

            <a href={`${homeBase}#programos`} className={desktopCtaClass}>
              {locale === 'lt' ? 'Peržiūrėti planus' : 'View plans'}
            </a>
          </div>

          <button type="button" onClick={() => setMobileOpen((c) => !c)} className={mobileToggleClass}>
            <span className="sr-only">Toggle menu</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <nav className={`${mobileOpen ? 'block' : 'hidden'} ${mobileMenuBaseClass} px-6 py-4 md:hidden transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <a
            href={user ? accountPath : loginPath}
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <svg className="h-5 w-5 translate-y-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {user ? (locale === 'lt' ? 'Paskyra' : 'Account') : (locale === 'lt' ? 'Prisijungti' : 'Sign in')}
          </a>

          <a href={cartPath} onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-2 text-sm font-semibold">
            <svg className="h-5 w-5 translate-y-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-12z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l-2-2H2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {locale === 'lt' ? 'Krepšelis' : 'Cart'}
            {cartCount > 0 ? (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full glass-green-surface px-1.5 py-0.5 text-xs font-extrabold text-black">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            ) : null}
          </a>

          <div className="flex items-center gap-1 rounded-full border border-black/20 p-1">
            <button type="button" onClick={() => switchTo('lt')} className={`px-2 py-1 rounded-full text-xs font-semibold ${locale === 'lt' ? 'bg-black text-white' : ''}`}>LT</button>
            <button type="button" onClick={() => switchTo('en')} className={`px-2 py-1 rounded-full text-xs font-semibold ${locale === 'en' ? 'bg-black text-white' : ''}`}>EN</button>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              {item.label}
            </a>
          ))}
        </div>

        <a href={`${homeBase}#programos`} onClick={() => setMobileOpen(false)} className={mobileCtaClass}>
          {locale === 'lt' ? 'Peržiūrėti planus' : 'View plans'}
        </a>
      </nav>
    </header>

    <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
