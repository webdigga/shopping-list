# Legacy shopping list archive

The original CRUD shopping list was archived on 2026-10-19, before the rebuild into the meal-plan app.

## What is archived

- **Code:** git tag `legacy-v1` and branch `legacy-v1` (both pushed to origin).
- **Data:** `legacy-d1-2026-10-19.sql`, an export of the remote D1 database `shopping-list-db`. The `settings` (PIN hash) and `sessions` rows were stripped before committing; their table definitions are kept, and the live rows are still in D1.
- **Items:** `legacy-items-2026-10-19.json`, the `items` table as a readable list.

## The old tables are still live

The meal-plan app only adds tables prefixed `mp_`. The original tables (`items`, `settings`, `sessions`) are left in place in `shopping-list-db`, so the old data is still there and the old app works against it unchanged.

## How to restore the old app

1. Check out the legacy code:

   ```bash
   git checkout legacy-v1
   ```

2. Build and deploy the front end (same as `.github/workflows/deploy.yml`):

   ```bash
   npm ci
   npm run build:frontend
   npx wrangler pages deploy frontend/dist --project-name=shopping-list --branch=main
   ```

3. Deploy the worker:

   ```bash
   cd worker
   npx wrangler deploy
   ```

No data restore is needed, because the old tables were never touched.

## If the old tables were ever lost

Recreate them from the SQL export:

```bash
npx wrangler d1 execute shopping-list-db --remote --file=archive/legacy-d1-2026-10-19.sql
```

Check the export first: it contains `CREATE TABLE` statements, so run it only against a database where those tables do not already exist. A restore from this file has no PIN set, so a new PIN must be set before the old app can be used.
