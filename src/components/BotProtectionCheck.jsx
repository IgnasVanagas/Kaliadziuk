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
  const [isScriptReady, setIsScriptReady] = useState(() => Boolean(window.turnstile));
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasError, setHasError] = useState(false);

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

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      size: 'invisible',
      callback: (token) => {
        setHasError(false);
        setIsVerifying(false);
        onChange(String(token || '').trim());
      },
      'expired-callback': () => {
        setIsVerifying(false);
        onChange('');
      },
      'error-callback': () => {
        setHasError(true);
        setIsVerifying(false);
        onChange('');
      },
    });
  }, [isEnabled, isScriptReady, onChange, siteKey]);

  useEffect(() => {
    if (!isEnabled) return;
    if (widgetIdRef.current !== null && window.turnstile?.reset) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setHasError(false);
    setIsVerifying(false);
    onChange('');
  }, [isEnabled, onChange, resetSignal]);

  const isChecked = !isEnabled || value === 'disabled' || Boolean(value);
  const isLoading = isEnabled && (!isScriptReady || isVerifying);

  const runCheck = () => {
    if (!isEnabled) return;
    if (isChecked) return;
    if (!window.turnstile?.execute || widgetIdRef.current === null) {
      setHasError(true);
      return;
    }

    setHasError(false);
    setIsVerifying(true);
    try {
      window.turnstile.execute(widgetIdRef.current);
    } catch {
      setHasError(true);
      setIsVerifying(false);
      onChange('');
    }
  };

  return (
    <div className={className}>
      <label
        className="flex items-center gap-3 text-sm text-black cursor-pointer group"
        role="checkbox"
        aria-checked={isChecked}
        aria-label={locale === 'lt' ? 'Aš ne robotas' : "I'm not a robot"}
        tabIndex={0}
        onClick={runCheck}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            runCheck();
          }
        }}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <input
            id={checkId}
            type="checkbox"
            checked={isChecked}
            readOnly
            className="peer sr-only"
          />
          <span
            className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white transition-all peer-checked:border-[#DCF41E] peer-checked:bg-[#DCF41E] peer-focus:ring-2 peer-focus:ring-[#DCF41E] peer-focus:ring-offset-2"
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
        <span>{locale === 'lt' ? 'Aš ne robotas' : "I'm not a robot"}</span>
      </label>

      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      />

      {hasError ? (
        <p className="mt-2 text-xs text-red-600">
          {locale === 'lt' ? 'Nepavyko patikrinti. Pabandykite dar kartą.' : 'Verification failed. Please try again.'}
        </p>
      ) : null}
    </div>
  );
}
