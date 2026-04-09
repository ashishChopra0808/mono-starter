/**
 * Recursively flattens a nested translation object into dot-separated key unions.
 * Depth-limited to 6 levels to prevent TS2589 with generic constraints.
 *
 *   { common: { hello: "Hi" } }  →  "common.hello"
 */
export type FlattenKeys<
  T,
  Prefix extends string = '',
  Depth extends unknown[] = [],
> = Depth['length'] extends 6
  ? `${Prefix}${string}`
  : T extends string
    ? Prefix
    : {
        [K in keyof T & string]: FlattenKeys<
          T[K],
          Prefix extends '' ? K : `${Prefix}.${K}`,
          [...Depth, unknown]
        >;
      }[keyof T & string];

/** A recursive record whose leaves are strings. */
export type NestedMessages = { readonly [key: string]: string | NestedMessages };

/** Map of locale code → translation tree. */
export type LocaleMap = Record<string, NestedMessages>;

export type Direction = 'ltr' | 'rtl';

export interface I18nContextValue<
  TLocale extends string = string,
  TKey extends string = string,
> {
  locale: TLocale;
  setLocale: (locale: TLocale) => void;
  t: (key: TKey, params?: Record<string, string | number>) => string;
  dir: Direction;
  supportedLocales: TLocale[];
}
