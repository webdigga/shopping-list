# shopping-list (meal plan app)

## 🔄 Active work

Meal plan app is live and in use. Week 1 is done, Week 2 started Friday 30 Oct 2026.

1. Confirm migrations 0004 to 0006 are applied remotely (`npm run db:migrate:remote -w worker`); 0006 brings back `mp_stock`, which the "I have" boxes need
2. Review Week 2 and Week 3 as David reaches them

## Context

- Spec: `SPEC.md`. Plan content: `meal-plan-data.json` (source of truth, bundled into the front end at build).
- Legacy CRUD shopping list is archived: tag and branch `legacy-v1`, data in `archive/`, restore steps in `archive/README.md`.
- D1 (`shopping-list-db`): new tables use the `mp_` prefix (`worker/migrations/`). Legacy `items` is untouched; `settings` and `sessions` still back the PIN login.
- Nothing on the shopping list is editable in the app, by David's choice: every addition (plan or household extras in `meal-plan-data.json` `extras`) goes through Claude so calories stay capped.
- After editing `meal-plan-data.json`, run `scripts/recompute-plan.py`; tests fail if macros, totals or shopping stop adding up.
- Week rules live in `shared/weekState.ts`, used by both the worker (persists the advance) and the front end (display).
- Checks: `npm run build:frontend`, `npm test`, `npm run lint`, `npx tsc -p worker`.
