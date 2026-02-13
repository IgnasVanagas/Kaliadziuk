import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getConsent } from './ConsentBanner';

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (!gaId) return;

    const loadGa = () => {
      // Load the script if it's not already there
      if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaId);
      }
    };

    // Check initial consent
    if (getConsent() === 'granted') {
      loadGa();
    }

    // Listen for consent updates
    const onConsentUpdate = (e) => {
      if (e.detail === 'granted') {
        loadGa();
      }
    };

    window.addEventListener('cookie-consent-updated', onConsentUpdate);
    return () => window.removeEventListener('cookie-consent-updated', onConsentUpdate);
  }, []);

  useEffect(() => {
    // Send pageview on route change (for Single Page Apps)
    // GA4 Enhanced Measurement handles many history changes, but explicit calls ensure accuracy.
    const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    // Only send if initialized
    if (gaId && window.gtag) {
      window.gtag('config', gaId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}
