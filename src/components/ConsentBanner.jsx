import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'cookie_consent';

export function getConsent() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export default function ConsentBanner() {
  const [show, setShow] = useState(false);
  const location = useLocation();
  // Simple check for locale
  const isLt = !location.pathname.startsWith('/en');

  useEffect(() => {
    // If no consent stored, show banner
    if (getConsent() === null) {
      setShow(true);
    }
  }, []);

  const handleResponse = (granted) => {
    const value = granted ? 'granted' : 'denied';
    localStorage.setItem(STORAGE_KEY, value);
    setShow(false);
    
    // Dispatch event so other components (SiteMetrics) can react immediately
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: value }));
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-black/10 bg-white p-4 shadow-2xl md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-black/80 md:max-w-3xl">
          {isLt ? (
            <p>
              Mes naudojame slapukus, kad užtikrintume geriausią naršymo patirtį ir analizuotume svetainės srautą. 
              Paspausdami „Sutinku“, sutinkate su mūsų slapukų naudojimo politika.
            </p>
          ) : (
            <p>
              We use cookies to ensure the best browsing experience and analyze site traffic. 
              By clicking "Accept", you agree to our use of cookies.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleResponse(false)}
            className="rounded-full border border-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-black/5"
          >
            {isLt ? 'Atmesti' : 'Reject'}
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent hover:text-black"
          >
            {isLt ? 'Sutinku' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
