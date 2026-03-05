import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getConsent } from './ConsentBanner';

export default function SiteMetrics() {
  const location = useLocation();

  useEffect(() => {
    const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (!gaId) return;

    const loadGa = () => {
      if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaId);
      }
    };

    if (getConsent() === 'granted') {
      loadGa();
    }

    const onConsentUpdate = (event) => {
      if (event.detail === 'granted') {
        loadGa();
      }
    };

    window.addEventListener('cookie-consent-updated', onConsentUpdate);
    return () => window.removeEventListener('cookie-consent-updated', onConsentUpdate);
  }, []);

  useEffect(() => {
    const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (gaId && window.gtag) {
      window.gtag('config', gaId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}
