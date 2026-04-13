'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { FlattenKeys, LocaleMap, NestedMessages, Direction } from './types.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

function getNestedValue(
  obj: NestedMessages,
  path: string,
): string | undefined {
  const keys = path.split('.');
  let current: NestedMessages | string = obj;
  for (const key of keys) {
    if (typeof current === 'string' || current == null) return undefined;
    current = current[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] != null ? String(params[key]) : `{{${key}}}`,
  );
}

// ── Public types ─────────────────────────────────────────────────────────────

export interface I18nConfig<T extends LocaleMap> {
  translations: T;
  defaultLocale: keyof T & string;
  fallbackLocale?: keyof T & string;
}

export interface I18nInstance<
  TLocale extends string,
  TKeys extends string,
> {
  locale: TLocale;
  setLocale: (l: TLocale) => void;
  t: (key: TKeys, params?: Record<string, string | number>) => string;
  dir: Direction;
  supportedLocales: TLocale[];
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createI18n<const T extends LocaleMap>(config: I18nConfig<T>) {
  type Locale = keyof T & string;
  type Keys = FlattenKeys<T[typeof config.defaultLocale]>;
  type Ctx = I18nInstance<Locale, Keys>;

  const { translations, defaultLocale, fallbackLocale } = config;
  const supportedLocales = Object.keys(translations) as Locale[];

  /**
   * Resolve a translation key for the given locale.
   * Fallback chain: locale → fallbackLocale → defaultLocale → raw key.
   */
  function translate(
    locale: Locale,
    key: Keys,
    params?: Record<string, string | number>,
  ): string {
    const keyStr = key as string;

    const primary = translations[locale];
    let value = primary ? getNestedValue(primary, keyStr) : undefined;

    if (
      value === undefined &&
      fallbackLocale &&
      locale !== fallbackLocale
    ) {
      const fb = translations[fallbackLocale];
      value = fb ? getNestedValue(fb, keyStr) : undefined;
    }

    if (value === undefined && locale !== defaultLocale) {
      const def = translations[defaultLocale];
      value = def ? getNestedValue(def, keyStr) : undefined;
    }

    return value !== undefined ? interpolate(value, params) : keyStr;
  }

  // ── React bindings ───────────────────────────────────────────────────────

  const I18nContext = createContext<Ctx | undefined>(undefined);

  function I18nProvider({
    children,
    initialLocale,
  }: {
    children: React.ReactNode;
    initialLocale?: Locale;
  }) {
    const [locale, setLocaleRaw] = useState<Locale>(
      initialLocale ?? defaultLocale,
    );

    const setLocale = useCallback(
      (next: Locale) => {
        if (supportedLocales.includes(next)) setLocaleRaw(next);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const t = useCallback(
      (key: Keys, params?: Record<string, string | number>) =>
        translate(locale, key, params),
      [locale],
    );

    const dir: Direction = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';

    const value: Ctx = useMemo(
      () => ({ locale, setLocale, t, dir, supportedLocales }),
      [locale, setLocale, t, dir],
    );

    return <I18nContext value={value}>{children}</I18nContext>;
  }

  function useTranslation(): Ctx {
    const ctx = useContext(I18nContext);
    if (!ctx) {
      throw new Error(
        'useTranslation must be used within an <I18nProvider>',
      );
    }
    return ctx;
  }

  return {
    translate,
    defaultLocale,
    supportedLocales,
    I18nProvider,
    useTranslation,
  } as const;
}
