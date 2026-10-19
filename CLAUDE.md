# shopping-list (meal plan app)

## 🔄 Active work

Meal plan rebuild from `SPEC.md` is built; not yet deployed.

1. Apply the D1 migrations (0002 and 0003 drop the unused `mp_stock` and `mp_task_ticks`): `npm run db:migrate:remote -w worker`
2. Deploy (push to `main`; GitHub Actions deploys Pages and the worker)
3. Open the app, set Week and start Friday, check it on the phone

## Context

- Spec: `SPEC.md`. Plan content: `meal-plan-data.json` (source of truth, bundled into the front end at build).
- Legacy CRUD shopping list is archived: tag and branch `legacy-v1`, data in `archive/`, restore steps in `archive/README.md`.
- D1 (`shopping-list-db`): new tables use the `mp_` prefix (`worker/migrations/`). Legacy `items` is untouched; `settings` and `sessions` still back the PIN login.
- Week rules live in `shared/weekState.ts`, used by both the worker (persists the advance) and the front end (display).
- Checks: `npm run build:frontend`, `npm test`, `npm run lint`, `npx tsc -p worker`.
