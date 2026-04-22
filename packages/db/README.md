# @mono/db

Shared database package providing the PostgreSQL schema, Drizzle ORM client, and migration/seed tooling.

## Usage

```typescript
import { getDb, users } from '@mono/db';
import { eq } from 'drizzle-orm';

const db = getDb();
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.email, 'admin@example.com'));
```

## Import Paths

- `@mono/db` — Client + schema (most common)
- `@mono/db/schema` — Schema tables + inferred types only
- `@mono/db/client` — Client (`getDb` / `closeDb`) only

## Scripts

```bash
pnpm db:generate   # Generate migration SQL from schema changes
pnpm db:migrate    # Apply pending migrations
pnpm db:seed       # Insert development seed data
pnpm db:studio     # Open Drizzle Studio (visual DB browser)
```

## Full Documentation

See [docs/DATABASE.md](../../docs/DATABASE.md) for complete documentation on:
- How migrations work
- How to add new tables
- How app code accesses the database
- Production considerations
