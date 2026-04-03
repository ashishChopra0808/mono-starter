# @mono/ui-web — Architecture & Conventions

## What This Package Is

`@mono/ui-web` is a shared, presentation-only component library for the monorepo's web applications (`apps/web` and `apps/admin`). It follows [shadcn/ui](https://ui.shadcn.com) conventions:

- Components are built on **Radix UI** headless primitives for accessibility
- Styled with **Tailwind CSS** utility classes
- Variant APIs powered by **class-variance-authority (CVA)**
- All className props are composable via the `cn()` utility (clsx + tailwind-merge)

---

## What Belongs in `ui-web`

A component belongs here if it satisfies **all** of these criteria:

| Criterion | Example |
|---|---|
| **Stateless / presentation-only** | Button, Card, Dialog shell |
| **No business logic** | No API calls, no routing, no data transformations |
| **Reusable across ≥2 apps** | Used by both `web` and `admin` |
| **Accepts data via props** | `<Card title={...}>` not `<BookingCard>` |
| **Emits events via callbacks** | `onClick`, `onOpenChange`, etc. |

### ✅ Good candidates for `ui-web`

- `Button`, `Input`, `Label`, `Card`, `Dialog`, `DropdownMenu`
- Layout primitives (Container, Grid wrappers)
- Data display primitives (Badge, Avatar, Table shell)
- Feedback primitives (Toast, Alert, Skeleton)

### ❌ Does NOT belong in `ui-web`

- `<BookingCard>` — fetches booking data, contains business logic
- `<AdminSidebar>` — app-specific navigation
- `<LoginForm>` — contains auth logic, API calls, redirect behavior
- `<PaymentSummary>` — business-specific data transformation and display
- Any component that imports from `@mono/api-contracts`, `@mono/auth`, or `@mono/db`

**Rule of thumb**: If a component needs to `import` from any package other than `react`, `@mono/ui-web` itself, or generic utilities — it belongs in the app.

---

## Theme Token Flow

```
@mono/design-tokens (TypeScript)
        │
        ▼
  CSS Custom Properties
  (declared in each app's global.css)
        │
        ▼
  @mono/config-tailwind preset
  (maps Tailwind classes → CSS vars)
        │
        ▼
  Tailwind utility classes in components
  (e.g. bg-background, text-primary)
        │
        ▼
  Theme switch via data-theme attribute
  (ThemeProvider sets document.documentElement)
```

Key points:
- **Design tokens are the single source of truth.** Raw values live only in `@mono/design-tokens`.
- **CSS custom properties** are generated once per app in `global.css`. They are **not** duplicated in `ui-web`.
- **Tailwind config** (`@mono/config-tailwind/preset`) simply maps class names to `var(--color-*)` references.
- **Theme switching** works automatically — changing `data-theme` on `<html>` swaps all CSS variable values.

---

## Component Conventions

### File Structure

```
packages/ui-web/src/
├── components/
│   ├── button.tsx         # One component per file
│   ├── card.tsx           # Sub-components exported together
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── sonner.tsx
├── lib/
│   └── utils.ts           # cn() helper
├── globals.css            # Tailwind layers + base reset
└── index.ts               # Barrel export
```

### Coding Standards

1. **`forwardRef` always.** Every component wrapping a DOM element uses `React.forwardRef` so consumers can attach refs.

2. **`cn()` for all classNames.** Always merge with `cn()` so consumers can override:
   ```tsx
   <div className={cn('rounded-lg border', className)} />
   ```

3. **`asChild` via Radix Slot.** Components that render a single element support polymorphism:
   ```tsx
   <Button asChild>
     <Link href="/dashboard">Go</Link>
   </Button>
   ```

4. **CVA for variants.** Multi-variant components use `class-variance-authority`:
   ```tsx
   const buttonVariants = cva('base-classes', {
     variants: { variant: { ... }, size: { ... } },
     defaultVariants: { variant: 'default', size: 'default' },
   });
   ```

5. **No `'use client'` unless necessary.** Only add the directive if the component uses hooks, event handlers, or browser APIs. Pure markup components (Card, Label) remain server-compatible.

6. **`displayName` on every forwardRef component.** Required for React DevTools.

---

## Adding a New Component — Checklist

1. **Is it reusable across apps?** If only one app needs it, keep it in that app.
2. **Is it presentation-only?** If it contains business logic or data fetching, it doesn't belong here.
3. Create `packages/ui-web/src/components/<name>.tsx`
4. Use `forwardRef`, `cn()`, CVA (if variants needed)
5. Export from `packages/ui-web/src/index.ts`
6. Ensure Tailwind content paths in both apps cover new files (they should if using `../../packages/ui-web/src/**/*.{ts,tsx}`)

---

## Import Model

`@mono/ui-web` is consumed **as source** (TSX), not as pre-compiled JavaScript. This is enabled by:

1. `package.json` `exports` using the `"mono-starter"` custom condition → `./src/index.ts`
2. `tsconfig.base.json` paths mapping `@mono/ui-web` → source
3. `next.config.js` `transpilePackages: ['@mono/ui-web']` in each app

This approach:
- Eliminates a separate build step for the UI library
- Enables perfect tree-shaking by the app bundler
- Provides instant HMR during development
