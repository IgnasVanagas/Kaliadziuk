import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import lt from '../locales/lt.json';
import en from '../locales/en.json';

export const SUPPORTED_LOCALES = ['lt', 'en'];
export const DEFAULT_LOCALE = 'lt';
export const LOCALE_STORAGE_KEY = 'locale';

export function normalizeLocale(locale) {
  if (!locale) return DEFAULT_LOCALE;
  const lower = String(locale).toLowerCase();
  if (SUPPORTED_LOCALES.includes(lower)) return lower;
  return DEFAULT_LOCALE;
}

export function getStoredLocale() {
  try {
    return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function setStoredLocale(locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, normalizeLocale(locale));
  } catch {
    // ignore
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      lt: { translation: lt },
      en: { translation: en },
    },
    lng: getStoredLocale(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
  });

export default i18n;
