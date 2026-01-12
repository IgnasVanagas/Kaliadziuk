import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SiteHeader from './components/SiteHeader.jsx';
import CustomCursor from './CustomCursor.jsx';
import CustomScrollbar from './CustomScrollbar.jsx';
import { getLocaleFromPathname, pickInitialLocale, persistLocale } from './lib/locale';

import HomeLtLegacy from './pages/HomeLtLegacy';
import Plans from './pages/Plans';
import GiftCard from './pages/GiftCard';
import Cart from './pages/Cart';
import Legal from './pages/Legal';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Payment from './pages/Payment';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const stored = (() => {
      try { return localStorage.getItem('locale'); } catch { return null; }
    })();
    const locale = stored || pickInitialLocale();
    persistLocale(locale);
    navigate(`/${locale}`, { replace: true });
  }, [navigate]);
  return null;
}

function LocaleShell() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const locale = getLocaleFromPathname(location.pathname);
    if (!locale) return;
    persistLocale(locale);
    if (i18n.language !== locale) i18n.changeLanguage(locale);
  }, [location.pathname, i18n]);

  return (
    <>
      <CustomCursor />
      <CustomScrollbar />
      <SiteHeader />
      {/* spacer equal to header height to prevent content jump when header is fixed */}
      <div aria-hidden="true" className="h-16 md:h-20" />
      <Outlet />
    </>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<LocaleShell />}>
        <Route path="/lt" element={<HomeLtLegacy />} />
        <Route path="/en" element={<HomeLtLegacy />} />

        <Route path="/lt/planai" element={<Plans />} />
        <Route path="/en/plans" element={<Plans />} />

        <Route path="/lt/dovanu-kuponas" element={<GiftCard />} />
        <Route path="/en/gift-card" element={<GiftCard />} />

        <Route path="/lt/krepselis" element={<Cart />} />
        <Route path="/en/cart" element={<Cart />} />

        <Route path="/lt/mokejimas" element={<Payment />} />
        <Route path="/en/payment" element={<Payment />} />

        <Route path="/lt/privatumas" element={<Legal kind="privacy" />} />
        <Route path="/en/privacy" element={<Legal kind="privacy" />} />

        <Route path="/lt/taisykles" element={<Legal kind="terms" />} />
        <Route path="/en/terms" element={<Legal kind="terms" />} />

        <Route path="/lt/grazinimas" element={<Legal kind="refunds" />} />
        <Route path="/en/refunds" element={<Legal kind="refunds" />} />

        <Route path="/lt/sekme" element={<Success />} />
        <Route path="/en/success" element={<Success />} />

        <Route path="/lt/atsaukta" element={<Cancel />} />
        <Route path="/en/cancel" element={<Cancel />} />

        <Route path="/lt/admin" element={<Admin />} />
        <Route path="/en/admin" element={<Navigate to="/lt/admin" replace />} />

        <Route path="/lt/*" element={<NotFound />} />
        <Route path="/en/*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
