import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';

export default function RequireAuth({ children, locale }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (user) return children;

  const loginPath = locale === 'en' ? '/en/login' : '/lt/prisijungti';
  const next = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`${loginPath}?next=${next}`} replace />;
}
