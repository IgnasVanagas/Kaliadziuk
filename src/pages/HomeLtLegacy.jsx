import { useLocation } from 'react-router-dom';
import AppLegacy from '../AppLegacy.jsx';
import Seo from '../components/Seo.jsx';

export default function HomeLtLegacy() {
  const location = useLocation();
  const locale = location.pathname.startsWith('/en') ? 'en' : 'lt';
  return (
    <>
      <Seo locale={locale} />
      <AppLegacy locale={locale} />
    </>
  );
}
