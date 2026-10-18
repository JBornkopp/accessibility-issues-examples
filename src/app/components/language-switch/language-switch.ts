import { ChangeDetectionStrategy, Component, LOCALE_ID, inject } from '@angular/core';

import { type AppLocale, SUPPORTED_LOCALES, isAppLocale, storeLocale } from '../../i18n/locale';
import { Dropdown, type DropdownOption } from '../dropdown/dropdown';

/** Language names written in the language itself (e.g. "Deutsch"). */
const NATIVE_NAMES: Readonly<Record<AppLocale, string>> = {
  de: 'Deutsch',
  en: 'English',
};

/**
 * Accessible language switch based on the shared {@link Dropdown}.
 *
 * Every option shows its native name and carries its own `lang` (WCAG 3.1.2).
 * Switching stores the choice and reloads, since translations are applied at
 * bootstrap time.
 */
@Component({
  selector: 'app-language-switch',
  standalone: true,
  imports: [Dropdown],
  template: `
    <app-dropdown
      navLabel="Sprache auswählen"
      i18n-navLabel="@@languageSwitch.label"
      prefix="Sprache:"
      i18n-prefix="@@languageSwitch.prefix"
      [options]="options"
      [value]="currentLocale"
      (selected)="select($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitch {
  private readonly localeId: string = inject(LOCALE_ID);

  protected readonly currentLocale: AppLocale = isAppLocale(this.localeId)
    ? this.localeId
    : SUPPORTED_LOCALES[0];

  protected readonly options: readonly DropdownOption<AppLocale>[] = SUPPORTED_LOCALES.map(
    (locale: AppLocale): DropdownOption<AppLocale> => ({
      value: locale,
      label: NATIVE_NAMES[locale],
      lang: locale,
    }),
  );

  protected select(locale: AppLocale): void {
    storeLocale(locale);
    location.reload();
  }
}
