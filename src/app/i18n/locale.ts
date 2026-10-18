/** Locales supported by the application. German is the source locale. */
export const SUPPORTED_LOCALES = ['de', 'en'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const SOURCE_LOCALE: AppLocale = 'de';

const STORAGE_KEY = 'app-locale';

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Resolves the locale to use: a previously stored choice wins, otherwise the
 * browser language, falling back to the source locale.
 */
export function resolveInitialLocale(): AppLocale {
  try {
    const stored: string | null = localStorage.getItem(STORAGE_KEY);
    if (isAppLocale(stored)) {
      return stored;
    }
  } catch {
    // Storage may be unavailable (privacy mode) — ignore.
  }
  const browser: string = (navigator.language ?? '').slice(0, 2).toLowerCase();
  return isAppLocale(browser) ? browser : SOURCE_LOCALE;
}

export function storeLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage may be unavailable (privacy mode) — ignore.
  }
}
