// Client-side i18n for static export
export type Locale = 'ru' | 'en';

export const defaultLocale: Locale = 'en';

export const locales: Locale[] = ['ru', 'en'];

export const localeNames: Record<Locale, string> = {
  ru: 'Russian',
  en: 'English',
};
