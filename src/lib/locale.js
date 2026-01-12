import { DEFAULT_LOCALE, normalizeLocale, setStoredLocale } from '../i18n';

export function getLocaleFromPathname(pathname) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  const prefix = parts[0];
  if (prefix === 'lt' || prefix === 'en') return prefix;
  return null;
}

export function pickInitialLocale() {
  const nav = (navigator.language || '').toLowerCase();
  return nav.startsWith('lt') ? 'lt' : 'en';
}

export function persistLocale(locale) {
  setStoredLocale(normalizeLocale(locale));
}
