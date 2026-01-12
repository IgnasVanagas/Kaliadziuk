import { useLocation } from 'react-router-dom';
import AppLegacy from '../AppLegacy.jsx';

export default function HomeLtLegacy() {
  const location = useLocation();
  const locale = location.pathname.startsWith('/en') ? 'en' : 'lt';
  return <AppLegacy locale={locale} />;
}
