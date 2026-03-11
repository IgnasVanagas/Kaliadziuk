import { useEffect, useMemo, useRef, useState } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-api-script';

export default function BotProtectionCheck({
  locale = 'lt',
  checkId,
  value,
  onChange,
  resetSignal = 0,
  className = '',
}) {
  const siteKey = useMemo(() => String(import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim(), []);
  const isEnabled = Boolean(siteKey);

  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const retriedRef = useRef(false);
  const [isScriptReady, setIsScriptReady] = useState(() => Boolean(window.turnstile));
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasError, setHasError] = useState(false);
  // Track when Cloudflare needs the user to interact (e.g. tap a challenge).
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      onChange('disabled');
      return;
    }

    if (window.turnstile) {
      setIsScriptReady(true);
      return;
    }

    let cancelled = false;
    let script = document.getElementById(TURNSTILE_SCRIPT_ID);
    const handleLoad = () => {
      if (!cancelled) setIsScriptReady(true);
    };

    if (!script) {
      script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleLoad);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', handleLoad);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener('load', handleLoad);
    };
  }, [isEnabled, onChange]);

  useEffect(() => {
    if (!isEnabled || !isScriptReady || !containerRef.current || widgetIdRef.current !== null) return;
    if (!window.turnstile?.render) return;

    setIsVerifying(true);
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      execution: 'render',
      // Use 'execute' appearance — Cloudflare won't render its own visible checkbox.
      // The widget iframe stays truly invisible; our custom UI is the only thing shown.
      appearance: 'execute',
      size: 'compact',
      language: locale === 'lt' ? 'lt' : 'en',
      callback: (token) => {
        retriedRef.current = false;
        setHasError(false);
        setIsVerifying(false);
        setNeedsInteraction(false);
        onChange(String(token || '').trim());
      },
      'expired-callback': () => {
        setIsVerifying(true);
        onChange('');
        if (widgetIdRef.current !== null && window.turnstile?.reset) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
      'error-callback': () => {
        if (!retriedRef.current) {
          retriedRef.current = true;
          setHasError(false);
          if (widgetIdRef.current !== null && window.turnstile?.reset) {
            window.turnstile.reset(widgetIdRef.current);
          }
          return;
        }
        setHasError(true);
        setIsVerifying(false);
        onChange('');
      },
      'before-interactive-callback': () => {
        // Cloudflare needs the user to interact (e.g. solve a challenge).
        // Show the Turnstile frame so the user can see it.
        setNeedsInteraction(true);
      },
      'after-interactive-callback': () => {
        setNeedsInteraction(false);
      },
    });
  }, [isEnabled, isScriptReady, onChange, siteKey, locale]);

  useEffect(() => {
    if (!isEnabled) return;
    if (widgetIdRef.current !== null && window.turnstile?.reset) {
      window.turnstile.reset(widgetIdRef.current);
    }
    retriedRef.current = false;
    setHasError(false);
    setIsVerifying(true);
    setNeedsInteraction(false);
    onChange('');
  }, [isEnabled, onChange, resetSignal]);

  const isChecked = !isEnabled || value === 'disabled' || Boolean(value);
  const isLoading = isEnabled && (!isScriptReady || isVerifying);

  const retryCheck = () => {
    if (!isEnabled) return;
    if (isChecked) return;
    if (!hasError) return;
    setHasError(false);
    setIsVerifying(true);
    setNeedsInteraction(false);
    retriedRef.current = false;
    if (widgetIdRef.current !== null && window.turnstile?.reset) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3 text-sm text-black">
        <span className="relative flex h-5 w-5 items-center justify-center">
          <input
            id={checkId}
            type="checkbox"
            checked={isChecked}
            readOnly
            className="peer sr-only"
          />
          <span
            className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white transition-all peer-checked:border-[#DCF41E] peer-checked:bg-[#DCF41E]"
          />
          {isLoading ? (
            <span className="pointer-events-none absolute -inset-1 rounded-full border-2 border-[#DCF41E]/25 border-t-[#acc300] animate-spin" />
          ) : null}
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 transition-opacity peer-checked:opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span>
          {isLoading
            ? (locale === 'lt' ? 'Tikrinama...' : 'Verifying...')
            : isChecked
              ? (locale === 'lt' ? 'Patvirtinta' : 'Verified')
              : (locale === 'lt' ? 'Aš ne robotas' : "I'm not a robot")}
        </span>
      </div>

      {/* Turnstile container — hidden by default; shown only when Cloudflare
          needs an interactive challenge (e.g. on iPhones with suspicious traffic). */}
      <div
        ref={containerRef}
        className={needsInteraction ? 'mt-2' : 'h-0 overflow-hidden'}
      />

      {hasError ? (
        <button
          type="button"
          onClick={retryCheck}
          className="mt-2 text-xs text-red-600 underline hover:text-red-800"
        >
          {locale === 'lt' ? 'Nepavyko patikrinti. Paspauskite bandyti dar kartą.' : 'Verification failed. Click to try again.'}
        </button>
      ) : null}
    </div>
  );
}
