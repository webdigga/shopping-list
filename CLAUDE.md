# shopping-list (meal plan app)

## 🔄 Active work

Meal plan app is live. Plan starts Friday 23 Oct 2026.

1. Apply migration 0004 (household and extras list): `npm run db:migrate:remote -w worker`
2. On the phone, set Week 1 starting Friday 23 Oct (Settings, Set week, Next Friday)
3. Review again after the first week of use

## Context

- Spec: `SPEC.md`. Plan content: `meal-plan-data.json` (source of truth, bundled into the front end at build).
- Legacy CRUD shopping list is archived: tag and branch `legacy-v1`, data in `archive/`, restore steps in `archive/README.md`.
- D1 (`shopping-list-db`): new tables use the `mp_` prefix (`worker/migrations/`). Legacy `items` is untouched; `settings` and `sessions` still back the PIN login.
- Week rules live in `shared/weekState.ts`, used by both the worker (persists the advance) and the front end (display).
- Checks: `npm run build:frontend`, `npm test`, `npm run lint`, `npx tsc -p worker`.
