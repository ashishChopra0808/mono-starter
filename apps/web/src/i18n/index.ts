import { createI18n, sharedTranslations } from '@mono/i18n';
import { en } from './en';
import { hi } from './hi';

const translations = {
  en: { ...sharedTranslations.en, ...en },
  hi: { ...sharedTranslations.hi, ...hi },
} as const;

export const { I18nProvider, useTranslation } = createI18n({
  translations,
  defaultLocale: 'en',
  fallbackLocale: 'en',
});
