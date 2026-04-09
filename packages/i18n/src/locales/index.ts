import { en } from './en.js';
import { hi } from './hi.js';

export { en, hi };

export const sharedTranslations = { en, hi } as const;

export const supportedLocales = ['en', 'hi'] as const;

export const defaultLocale = 'en' as const;

export type SupportedLocale = (typeof supportedLocales)[number];
