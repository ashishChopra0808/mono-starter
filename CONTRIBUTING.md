# Contributing

This document explains the code quality tooling in this monorepo and the reasoning behind each decision.

## Quick Reference

```bash
# Lint all projects (Nx-cached, per-project)
pnpm lint

# Auto-fix lint issues across the whole workspace
pnpm lint:fix

# Format all files with Prettier
pnpm format

# Check formatting without writing changes (useful in CI)
pnpm format:check

# Type-check all projects
pnpm typecheck
```

## Tooling Overview

| Tool                    | Purpose                           | Config location                                     |
| ----------------------- | --------------------------------- | --------------------------------------------------- |
| ESLint v9 (flat config) | Code correctness, style           | `packages/config-eslint/`                           |
| Prettier                | Code formatting                   | `packages/config-prettier/`                         |
| TypeScript              | Static typing                     | `packages/config-typescript/`, `tsconfig.base.json` |
| Nx                      | Caching, per-project lint targets | `nx.json`                                           |

---

## ESLint Rules — Why They Matter

### `@typescript-eslint/no-explicit-any` — **error**

Using `any` defeats the purpose of TypeScript. It removes type checking for an expression and all its downstream consumers. Every `any` is a potential runtime bug hiding in plain sight.

**What to do instead:**

- Use `unknown` and narrow with a type guard
- Use a generic: `function wrap<T>(value: T): T`
- Declare a real interface or type alias

**Escape hatch** (use sparingly, with a comment explaining why):

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData = response as any;
```

---

### `@typescript-eslint/no-unused-vars` — **error**

Unused variables are almost always one of:

- A bug (forgot to use a value that should affect behavior)
- Dead code (should be deleted to reduce maintenance burden)
- A refactor artifact (safe to clean up)

**Exceptions:** Prefix with `_` to explicitly mark as intentionally unused:

```ts
function handler(_event: Event, context: Context): void { ... }
```

---

### `@typescript-eslint/consistent-type-imports` — **error** (web/mobile/packages)

Enforces `import type` for imports that are only used as types. This:

- Reduces bundle size (type imports are erased at compile time)
- Makes it immediately clear what is a value vs a type dependency
- Avoids circular dependency issues that only manifest at runtime

```ts
// Wrong
import { User } from '@mono/types';

// Correct
import type { User } from '@mono/types';
```

> **NestJS exception:** This rule is disabled in `config-eslint/nest.js` because NestJS uses `emitDecoratorMetadata` — class imports must remain value imports for dependency injection reflection to work correctly.

---

### `simple-import-sort/imports` — **error**

Import ordering is auto-fixable (`pnpm lint:fix`) and:

- Reduces merge conflicts (consistent ordering = less diff noise)
- Makes dependencies immediately scannable at the top of a file
- Groups external packages vs internal `@mono/*` imports automatically

Run `pnpm lint:fix` to auto-fix import ordering. You should never need to reorder imports by hand.

---

### `no-console` — **warn**

Console statements are useful for debugging but should be cleaned up before merging. They:

- Leak implementation details to production logs
- Clutter the output in test environments

Use the project's `@mono/logger` package for structured production logging.

**Escape hatch** for intentional console output:

```ts
// eslint-disable-next-line no-console
console.log('server started');
```

---

### NestJS: `@typescript-eslint/explicit-function-return-type` — **error**

NestJS controllers and services form the public API surface of the backend. Explicit return types:

- Make the contract of each endpoint immediately visible
- Catch type mismatches between service and controller layers at compile time
- Serve as lightweight documentation

```ts
// Wrong
getData() {
  return this.service.getData();
}

// Correct
getData(): UserDto {
  return this.service.getData();
}
```

---

## Prettier Rules

All projects share one Prettier config from `packages/config-prettier/index.js`:

| Setting         | Value   | Reason                                              |
| --------------- | ------- | --------------------------------------------------- |
| `semi`          | `true`  | Avoids ASI surprises                                |
| `singleQuote`   | `true`  | Less visual noise than double quotes                |
| `trailingComma` | `"all"` | Cleaner git diffs when adding items                 |
| `printWidth`    | `100`   | Wider than 80 for modern screens; narrower than 120 |
| `tabWidth`      | `2`     | Standard for JS/TS ecosystem                        |

Prettier runs independently of ESLint. The `eslint-config-prettier` package disables all ESLint rules that would conflict with Prettier, so the two tools never disagree.

---

## Adding a New Shared Package

1. Generate with: `pnpm nx g @nx/js:lib packages/<name> --bundler=tsc --importPath=@mono/<name>`
2. Create `packages/<name>/eslint.config.mjs`:
   ```js
   import baseConfig from '@mono/config-eslint/base';
   export default baseConfig;
   ```
3. Add the `@mono/*` path alias to `tsconfig.base.json`.

## Adding a New App

1. Generate with the appropriate Nx generator.
2. Create `apps/<name>/eslint.config.mjs` extending the right preset:
   - Next.js: `@mono/config-eslint/next`
   - NestJS: `@mono/config-eslint/nest`
   - Expo: `@mono/config-eslint/mobile`
3. Add an `ignores` entry for generated directories (`.next/`, `dist/`, etc.).

---

## Per-file Rule Exceptions

When a rule legitimately does not apply to a specific line:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

When a rule does not apply to an entire file (use sparingly, prefer fixing):

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
```

Always add a comment explaining **why** the rule is disabled.

---

## Why These Rules Matter Long-term

For a solo developer, strict linting might feel like overhead. The real value appears when:

1. **Returning to old code** — Explicit return types and no-any mean you don't have to mentally reconstruct what a function does; the types tell you.
2. **Merging PRs / reviewing diffs** — Consistent import ordering and formatting means diffs only show meaningful changes, not style noise.
3. **Onboarding a collaborator** — The tooling enforces standards automatically so you don't have to review for style.
4. **Catching bugs early** — `no-unused-vars` as an error has caught more real bugs than almost any other rule. If a variable is unused, ask why.
