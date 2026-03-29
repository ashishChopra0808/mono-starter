# mono-starter

A production-oriented full-stack monorepo boilerplate built with [Nx](https://nx.dev) and [pnpm](https://pnpm.io).

## Why a Monorepo?

A monorepo lets all apps and packages live in a single repository with shared tooling, unified versioning, and atomic cross-project changes. Nx adds smart build caching and dependency-aware task orchestration so only affected projects are rebuilt on each change.

## Architecture

```
mono-starter/
├── apps/
│   ├── web/          # Next.js App Router — customer-facing frontend
│   ├── admin/        # Next.js App Router — internal admin dashboard
│   ├── mobile/       # Expo — iOS/Android mobile app
│   └── api/          # NestJS — REST/GraphQL API server
└── packages/
    ├── ui-web/           # Shared React component library for web apps
    ├── ui-mobile/        # Shared React Native component library
    ├── design-tokens/    # Platform-agnostic design tokens (colors, spacing, typography)
    ├── i18n/             # Internationalization utilities and locale strings
    ├── types/            # Shared TypeScript types and interfaces
    ├── validation/       # Zod schemas for shared validation logic
    ├── utils/            # Pure utility functions shared across apps
    ├── auth/             # Auth helpers, guards, and token utilities
    ├── db/               # Database client and schema (Prisma/Drizzle)
    ├── logger/           # Structured logging abstraction
    ├── api-contracts/    # API request/response types (e.g., tRPC/REST contracts)
    ├── core/             # Core business logic shared between api and other consumers
    ├── env/              # Environment variable validation (type-safe env parsing)
    ├── config-typescript/ # Shared tsconfig presets (base, nextjs, nestjs, react-native)
    ├── config-eslint/     # Shared ESLint flat-config presets
    └── config-prettier/   # Shared Prettier config
```

All packages are scoped under `@mono/*` and imported via TypeScript path aliases defined in `tsconfig.base.json`.

## Getting Started

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- pnpm 10+

```bash
nvm use
npm install -g pnpm
```

### Install dependencies

```bash
pnpm install
```

### Development

```bash
# Run all apps in dev mode
pnpm dev

# Run a specific app
pnpm nx dev web
pnpm nx dev admin
pnpm nx dev api
pnpm nx dev mobile
```

### Build

```bash
# Build all projects (respects dependency order)
pnpm build

# Build a specific project
pnpm nx build web
```

### Other commands

```bash
pnpm lint       # Lint all projects
pnpm test       # Run all tests
pnpm typecheck  # Type-check all projects
```

## Nx Task Pipeline

Tasks are defined in `nx.json` and respect the project dependency graph:

| Task        | Cache | Depends On      |
| ----------- | ----- | --------------- |
| `build`     | Yes   | `^build` (deps) |
| `typecheck` | Yes   | `^typecheck`    |
| `lint`      | Yes   | —               |
| `test`      | Yes   | —               |

Run `pnpm nx graph` to visualize the full dependency graph.

## Package Imports

Each package is available via its `@mono/*` alias:

```ts
import { createLogger } from '@mono/logger';
import type { User } from '@mono/types';
import { userSchema } from '@mono/validation';
```

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Monorepo   | Nx 22 + pnpm workspaces      |
| Web        | Next.js 16 (App Router)      |
| Mobile     | Expo 54 (React Native)       |
| API        | NestJS 11                    |
| Language   | TypeScript 5.7               |
| Validation | Zod (via `@mono/validation`) |
