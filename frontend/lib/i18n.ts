import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['ru', 'kz'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ru';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = (cookieStore.get('locale')?.value as Locale) || defaultLocale;

  return {
    locale,
    messages: (await import(`../public/locales/${locale}/common.json`)).default,
  };
});
