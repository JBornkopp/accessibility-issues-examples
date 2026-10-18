import { DOCUMENT, DestroyRef, Injectable, inject, signal, type Signal } from '@angular/core';

/** User preference. `system` follows the OS setting (`prefers-color-scheme`). */
export type ThemePreference = 'light' | 'dark' | 'system';

/** The theme actually applied to the document. */
export type ResolvedTheme = 'light' | 'dark';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

/** Must match the key used by the no-flash script in `index.html`. */
const STORAGE_KEY = 'app-theme';

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

/**
 * Holds the theme preference and applies it as `data-theme` on `<html>`,
 * which switches the design tokens in `themes/_tokens.scss`.
 *
 * The initial attribute is already set by an inline script in `index.html`
 * before Angular boots, so there is no flash of the wrong theme.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document: Document = inject(DOCUMENT);

  private readonly media: MediaQueryList | undefined = this.document.defaultView?.matchMedia?.(
    '(prefers-color-scheme: dark)',
  );

  private readonly preferenceState = signal<ThemePreference>(this.readStoredPreference());

  public readonly preference: Signal<ThemePreference> = this.preferenceState.asReadonly();

  constructor() {
    this.apply();
    // Follow OS changes while the preference is `system`.
    const onChange = (): void => {
      if (this.preferenceState() === 'system') {
        this.apply();
      }
    };
    this.media?.addEventListener?.('change', onChange);
    inject(DestroyRef).onDestroy(() => this.media?.removeEventListener?.('change', onChange));
  }

  public setPreference(preference: ThemePreference): void {
    this.preferenceState.set(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Storage may be unavailable (privacy mode) — ignore.
    }
    this.apply();
  }

  private resolve(): ResolvedTheme {
    const preference: ThemePreference = this.preferenceState();
    if (preference !== 'system') {
      return preference;
    }
    return this.media?.matches ? 'dark' : 'light';
  }

  private apply(): void {
    this.document.documentElement.setAttribute('data-theme', this.resolve());
  }

  private readStoredPreference(): ThemePreference {
    try {
      const stored: string | null = localStorage.getItem(STORAGE_KEY);
      return isThemePreference(stored) ? stored : 'system';
    } catch {
      return 'system';
    }
  }
}
