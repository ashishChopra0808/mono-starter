# @mono/i18n

Shared internationalization (i18n) foundation for the mono-starter monorepo.

## Quick Start

```ts
// 1. Each app creates its own i18n instance by merging shared + app-specific translations.
import { createI18n, sharedTranslations } from '@mono/i18n';
import { en } from './i18n/en';
import { hi } from './i18n/hi';

const translations = {
  en: { ...sharedTranslations.en, ...en },
  hi: { ...sharedTranslations.hi, ...hi },
} as const;

export const { I18nProvider, useTranslation } = createI18n({
  translations,
  defaultLocale: 'en',
  fallbackLocale: 'en',
});

// 2. Wrap your app root with I18nProvider.
<I18nProvider>
  <App />
</I18nProvider>

// 3. Use translations in any component.
function MyComponent() {
  const { t, locale, setLocale, dir, supportedLocales } = useTranslation();
  return <h1>{t('common.welcome')}</h1>;
}
```

## Architecture

### Package Exports

| Export               | Description                                         |
| -------------------- | --------------------------------------------------- |
| `createI18n`         | Factory that produces a typed i18n instance          |
| `sharedTranslations` | `{ en, hi }` — shared locale files all apps inherit |
| `supportedLocales`   | `['en', 'hi']` tuple                                |
| `defaultLocale`      | `'en'`                                              |
| Type utilities       | `FlattenKeys`, `NestedMessages`, `LocaleMap`, etc.  |

### `createI18n(config)` → Instance

```ts
const instance = createI18n({
  translations: { en: { ... }, hi: { ... } },
  defaultLocale: 'en',
  fallbackLocale: 'en',   // optional — used when a key is missing in the active locale
});
```

Returns:

| Property            | Type                                             | Description                           |
| ------------------- | ------------------------------------------------ | ------------------------------------- |
| `I18nProvider`       | React component                                  | Context provider; wrap your app root  |
| `useTranslation()`  | Hook → `{ t, locale, setLocale, dir, ... }`      | Access translations in any component  |
| `translate()`       | `(locale, key, params?) => string`               | Standalone translate (non-React)      |
| `supportedLocales`  | `string[]`                                       | Array of locale codes                 |
| `defaultLocale`     | `string`                                         | The configured default                |

### Fallback Behavior

When resolving a key, the system follows this chain:

1. **Active locale** — try the current locale's translations.
2. **Fallback locale** — if configured and key is missing, try fallbackLocale.
3. **Default locale** — try defaultLocale (usually English).
4. **Raw key** — return the dot-path key as-is (e.g. `"common.welcome"`).

This means Hindi can omit keys that haven't been translated yet; they'll
gracefully fall back to English.

### Interpolation

Use `{{variable}}` placeholders:

```ts
// Translation: "Hello, {{name}}! You have {{count}} items."
t('greeting', { name: 'Ashish', count: 5 })
// → "Hello, Ashish! You have 5 items."
```

### RTL Support

`useTranslation()` exposes a `dir` property (`'ltr'` or `'rtl'`) based on the
active locale. Apply it to your root container:

```tsx
const { dir } = useTranslation();
return <div dir={dir}>...</div>;
```

Built-in RTL locales: `ar`, `he`, `fa`, `ur`. Both English and Hindi are LTR.

## Translation Key Organization

### Namespace Strategy

```
packages/i18n/src/locales/     ← SHARED keys (used across multiple apps)
  en.ts
  hi.ts

apps/web/src/i18n/             ← WEB-SPECIFIC keys
  en.ts                          (namespaced under `web.*`)
  hi.ts

apps/admin/src/i18n/           ← ADMIN-SPECIFIC keys
  en.ts                          (namespaced under `admin.*`)
  hi.ts

apps/mobile/src/i18n/          ← MOBILE-SPECIFIC keys
  en.ts                          (namespaced under `mobile.*`)
  hi.ts
```

### Shared Namespaces (in `@mono/i18n`)

| Namespace  | Purpose                                  | Examples                             |
| ---------- | ---------------------------------------- | ------------------------------------ |
| `common`   | Global labels and generic UI text        | `common.welcome`, `common.theme`     |
| `actions`  | Action verbs reused across apps          | `actions.save`, `actions.cancel`     |
| `status`   | Status labels                            | `status.confirmed`, `status.pending` |
| `states`   | Loading/empty/error states               | `states.loading`, `states.empty`     |
| `nav`      | Navigation labels                        | `nav.profile`, `nav.settings`        |
| `form`     | Common form field labels                 | `form.email`, `form.fullName`        |
| `locale`   | Human-readable locale names              | `locale.en`, `locale.hi`            |

### App-Specific Namespaces

Each app prefixes its keys with the app name to avoid collisions:

- `web.sections.button`, `web.cards.bookingSummary`
- `admin.stats.totalBookings`, `admin.table.bookingId`
- `mobile.sections.theme`, `mobile.cards.elevated`

### Rules of Thumb

1. **If 2+ apps need a key** → put it in `packages/i18n/src/locales/`.
2. **If only one app needs it** → put it in that app's `src/i18n/` folder.
3. **Prefix app keys** with the app name (`web.*`, `admin.*`, `mobile.*`).
4. **Keep namespaces shallow** — max 3 levels (e.g. `admin.stats.revenue`).

## Adding a New Language

1. Create the locale file in the shared package:

```ts
// packages/i18n/src/locales/fr.ts
export const fr = { common: { welcome: 'Bienvenue' }, ... } as const;
```

2. Export it from `packages/i18n/src/locales/index.ts`:

```ts
export { fr } from './fr.js';
export const sharedTranslations = { en, hi, fr } as const;
export const supportedLocales = ['en', 'hi', 'fr'] as const;
```

3. Add app-specific translations in each app's `src/i18n/` folder.

4. Merge in each app's `i18n/index.ts`:

```ts
const translations = {
  en: { ...sharedTranslations.en, ...en },
  hi: { ...sharedTranslations.hi, ...hi },
  fr: { ...sharedTranslations.fr, ...fr },
} as const;
```

The fallback chain ensures that any missing French keys will fall back to
English automatically.

## Adding a New App

1. Add `"@mono/i18n": "workspace:*"` to the app's `package.json`.
2. Create `src/i18n/en.ts` and `src/i18n/hi.ts` with app-specific keys.
3. Create `src/i18n/index.ts` using the pattern above.
4. Wrap the app root with `<I18nProvider>`.
5. If using Next.js, add `'@mono/i18n'` to `transpilePackages` in `next.config.js`.

## Type Safety

The `t()` function is fully typed. Autocompletion suggests all valid dot-path
keys, and passing an invalid key produces a TypeScript error:

```ts
t('common.welcome')         // ✓ valid
t('admin.stats.revenue')    // ✓ valid (in admin app)
t('nonexistent.key')        // ✗ TypeScript error
```

This is powered by the `FlattenKeys` utility type that recursively flattens
nested translation objects into a union of dot-separated string literals.

## Scaling Translation Files

As the project grows, consider these patterns:

### Split by Feature

Instead of one monolithic file per locale, split into feature modules:

```ts
// packages/i18n/src/locales/en/common.ts
// packages/i18n/src/locales/en/forms.ts
// packages/i18n/src/locales/en/navigation.ts
// packages/i18n/src/locales/en/index.ts  ← re-exports and merges all
```

### Extract to JSON (CI/Tooling)

For integration with translation management systems (Crowdin, Lokalise, Phrase),
export to JSON at build time:

```ts
// scripts/export-translations.ts
import { en } from '@mono/i18n';
fs.writeFileSync('locales/en.json', JSON.stringify(en, null, 2));
```

### Lazy Loading

For large apps, load translations per-route:

```ts
const lazyFr = () => import('./locales/fr');
```

### Plural / Gender Rules

For complex ICU-style formatting, consider wrapping the `t()` function with a
formatter like `@formatjs/intl-messageformat` while keeping the same key
structure.
