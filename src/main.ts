import { loadTranslations } from '@angular/localize';
import { bootstrapApplication } from '@angular/platform-browser';

import { type AppLocale, SOURCE_LOCALE, resolveInitialLocale } from './app/i18n/locale';

const locale: AppLocale = resolveInitialLocale();

async function bootstrap(): Promise<void> {
  if (locale !== SOURCE_LOCALE) {
    const { translations } = (await import(`./locale/messages.${locale}.json`)) as {
      translations: Record<string, string>;
    };
    loadTranslations(translations);
  }
  $localize.locale = locale;
  // Keep the document language in sync with the content (WCAG 3.1.1).
  document.documentElement.lang = locale;

  // Import the app only after translations are registered, so every
  // `$localize` call (templates and class fields) sees them.
  const [{ App }, { appConfig }] = await Promise.all([
    import('./app/app'),
    import('./app/app.config'),
  ]);
  await bootstrapApplication(App, appConfig);
}

bootstrap().catch((err: unknown) => console.error(err));
