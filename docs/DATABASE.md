# Database

This document covers the PostgreSQL + Drizzle ORM setup used across the monorepo.

## Quick Start

```bash
# 1. Start local Postgres (Docker required)
pnpm db:up

# 2. Generate the initial migration (if no migration files exist yet)
pnpm db:generate

# 3. Apply pending migrations
pnpm db:migrate

# 4. Seed sample data
pnpm db:seed

# 5. (Optional) Open Drizzle Studio — visual DB browser
pnpm db:studio
```

---

## Why Drizzle ORM?

| Criterion              | Drizzle                                                   | Prisma                                   | TypeORM                              |
| ---------------------- | --------------------------------------------------------- | ---------------------------------------- | ------------------------------------ |
| **Type safety**        | Schema _is_ TypeScript — zero codegen                     | Requires `prisma generate`               | Decorator-based, weaker inference    |
| **SQL proximity**      | Relational queries and raw SQL feel natural                | Custom SQL via `$queryRaw`               | Query builder, SQL bolted-on         |
| **Bundle size**        | ~50 KB                                                    | ~2 MB (engine binary)                    | ~500 KB                              |
| **Monorepo fit**       | Plain TS module, no binary engine                         | Engine binary complicates workspaces     | OK, but needs `emitDecoratorMetadata` |
| **Migration model**    | Generates reviewable SQL files from schema diff           | Opaque migration engine                  | Auto-sync or manual (risky)          |

**Bottom line:** Drizzle gives type safety without codegen, SQL-close semantics, and trivially works as a shared workspace package. Schemas are just TypeScript — if you ever need to switch ORMs, the schema knowledge stays as SQL.

---

## Architecture

```
packages/db/
├── drizzle.config.ts          # Drizzle Kit CLI config
├── src/
│   ├── index.ts               # Barrel: re-exports client + schema
│   ├── client.ts              # Lazy singleton DB client (getDb / closeDb)
│   ├── migrate.ts             # Standalone migration runner
│   ├── seed.ts                # Dev seed script
│   ├── schema/
│   │   ├── index.ts           # Barrel: all tables + inferred types
│   │   ├── users.ts           # users table
│   │   └── sessions.ts        # sessions table
│   └── drizzle/               # Generated migration SQL (git-tracked)
│       ├── 0000_*.sql
│       └── meta/
└── package.json
```

### Import Paths

| Import                 | What you get                             | Use when…                                    |
| ---------------------- | ---------------------------------------- | -------------------------------------------- |
| `@mono/db`             | Client (`getDb`, `closeDb`) + all schema | Most common — service code that queries       |
| `@mono/db/schema`      | Tables + inferred types only             | You only need types (no client instantiation) |
| `@mono/db/client`      | `getDb` / `closeDb` only                 | Rare — when you manage the schema separately  |

---

## How Migrations Work

Drizzle uses a **schema-diff** approach:

1. **You edit the schema** in `packages/db/src/schema/*.ts`.
2. **Generate a migration:**
   ```bash
   pnpm db:generate
   ```
   Drizzle Kit compares the current schema against the last snapshot and creates a SQL migration file in `packages/db/src/drizzle/`.
3. **Review the SQL.** Migration files are plain SQL — read them, edit them if needed.
4. **Apply the migration:**
   ```bash
   pnpm db:migrate
   ```
   The migration runner (`src/migrate.ts`) applies all pending migrations using a `__drizzle_migrations` metadata table.

### Adding a New Table

1. Create `packages/db/src/schema/<table_name>.ts`:
   ```typescript
   import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

   export const products = pgTable('products', {
     id: uuid().primaryKey().$defaultFn(() => crypto.randomUUID()),
     name: varchar({ length: 255 }).notNull(),
     createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
   });
   ```
2. Re-export from `packages/db/src/schema/index.ts`:
   ```typescript
   export * from './products.js';
   ```
3. Add inferred types (optional but recommended):
   ```typescript
   import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
   import type { products } from './products.js';

   export type Product = InferSelectModel<typeof products>;
   export type NewProduct = InferInsertModel<typeof products>;
   ```
4. Generate and apply:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

---

## How App Code Accesses the Database

### In a NestJS Service

```typescript
import { Injectable } from '@nestjs/common';
import { getDb, users } from '@mono/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  private readonly db = getDb();

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user ?? null;
  }

  async create(data: { email: string; name: string }) {
    const [user] = await this.db
      .insert(users)
      .values(data)
      .returning();
    return user;
  }
}
```

### Graceful Shutdown

In `main.ts` or an `OnApplicationShutdown` hook:

```typescript
import { closeDb } from '@mono/db';

app.enableShutdownHooks();

// Or manually:
process.on('SIGTERM', async () => {
  await closeDb();
  process.exit(0);
});
```

---

## Drizzle Studio

```bash
pnpm db:studio
```

Opens a visual database browser at `https://local.drizzle.studio`. You can browse tables, edit data, and run queries. Useful for debugging during development.

---

## Local Development

### Prerequisites

- **Docker** — for running PostgreSQL locally.
- Alternatively, set `DATABASE_URL` to any accessible Postgres instance.

### Docker Compose

The workspace root includes a `docker-compose.yml` with a Postgres 16 service:

```bash
pnpm db:up       # Start Postgres in the background
pnpm db:down     # Stop Postgres
```

Data persists across restarts via a named Docker volume. To fully reset:

```bash
docker compose down -v   # Removes the volume
pnpm db:up
pnpm db:migrate
pnpm db:seed
```

### Connection Defaults

| Variable       | Default Value                                        |
| -------------- | ---------------------------------------------------- |
| `DATABASE_URL` | `postgresql://mono:mono@localhost:5433/mono_starter`  |

These match the Docker Compose config. No manual setup needed.

---

## Production Considerations

1. **Connection pooling** — Use an external pooler like PgBouncer. The `postgres` driver's `max` is set to 10 by default; tune per deployment.
2. **SSL** — Add `?sslmode=require` to `DATABASE_URL` for cloud databases.
3. **Migrations in CI/CD** — Run `pnpm db:migrate` as a deployment step _before_ starting the application. Do not auto-migrate on boot in production.
4. **Backups** — Use your cloud provider's managed backup (RDS snapshots, Cloud SQL exports, etc.).

---

## All Database Commands

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `pnpm db:up`       | Start local Postgres via Docker Compose          |
| `pnpm db:down`     | Stop Docker Compose services                     |
| `pnpm db:generate` | Generate migration SQL from schema changes       |
| `pnpm db:migrate`  | Apply pending migrations                         |
| `pnpm db:seed`     | Insert development seed data                     |
| `pnpm db:studio`   | Open Drizzle Studio (visual DB browser)          |
