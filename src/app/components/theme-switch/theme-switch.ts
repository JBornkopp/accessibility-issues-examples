import { ChangeDetectionStrategy, Component, inject, type Signal } from '@angular/core';

import { THEME_PREFERENCES, ThemeService, type ThemePreference } from '../../theme/theme.service';
import { Dropdown, type DropdownOption } from '../dropdown/dropdown';

const THEME_LABELS: Readonly<Record<ThemePreference, string>> = {
  light: $localize`:@@themeSwitch.light:Hell`,
  dark: $localize`:@@themeSwitch.dark:Dunkel`,
  system: $localize`:@@themeSwitch.system:System`,
};

/**
 * Accessible theme switch based on the shared {@link Dropdown}.
 *
 * Offers light, dark and "system" (follows `prefers-color-scheme`). The choice
 * is applied immediately via {@link ThemeService} without reloading.
 */
@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [Dropdown],
  template: `
    <app-dropdown
      navLabel="Farbschema auswählen"
      i18n-navLabel="@@themeSwitch.label"
      prefix="Farbschema:"
      i18n-prefix="@@themeSwitch.prefix"
      [options]="options"
      [value]="preference()"
      (selected)="select($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitch {
  private readonly theme: ThemeService = inject(ThemeService);

  protected readonly preference: Signal<ThemePreference> = this.theme.preference;

  protected readonly options: readonly DropdownOption<ThemePreference>[] = THEME_PREFERENCES.map(
    (preference: ThemePreference): DropdownOption<ThemePreference> => ({
      value: preference,
      label: THEME_LABELS[preference],
    }),
  );

  protected select(preference: ThemePreference): void {
    this.theme.setPreference(preference);
  }
}
