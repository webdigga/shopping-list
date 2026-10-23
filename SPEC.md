# Meal plan app — build spec

Rebuild the `shopping-list` repo into a daily meal-plan app for one user (David).
The current CRUD shopping list is being replaced, but **nothing old is deleted**: it is archived first.

Plan content (recipes, grams, macros, shopping quantities, prep tasks) lives in
`meal-plan-data.json`, supplied alongside this spec. Treat that file as the source of truth.
D1 only stores David's state (which week he's on, ticks, stock counts).

---

## 0. Archive the current app first

Do this before changing anything.

1. Commit any uncommitted work, then create a git tag and branch:
   - `git tag legacy-v1` and `git branch legacy-v1`
   - Push both.
2. Export the live D1 data:
   - `npx wrangler d1 export <DB_NAME> --remote --output=archive/legacy-d1-<YYYY-MM-DD>.sql`
   - Also write the current items table to `archive/legacy-items-<YYYY-MM-DD>.json` (readable list of ingredients).
3. **Leave the existing D1 tables in place.** New tables use the `mp_` prefix, so the old ones are untouched.
4. Add `archive/README.md` explaining how to restore: check out `legacy-v1`, redeploy, and the old tables are still there.

Confirm the archive with David before continuing.

---

## 1. Stack

- Inspect the repo first and keep its hosting setup (Cloudflare + D1, Wrangler config, any existing auth).
- Front end: React + Vite, mobile-first, single page with a bottom tab bar.
- API: Cloudflare Pages Functions or a Worker (whichever the repo already uses), talking to D1.
- `meal-plan-data.json` is bundled into the front end at build time (it's static). No need to load it into D1.
- All dates and times in **Europe/London**.
- Keep whatever access protection the current app has. If there is none, add Cloudflare Access or a simple passcode.

---

## 2. How the plan works (read before coding)

- **3-week rotating cycle**: Week 1 → 2 → 3 → back to 1.
- **A plan week runs Friday to Thursday.** David shops first thing on Friday; the week starts when he gets home.
  `meal-plan-data.json` → `dayOrder` is `["fri","sat","sun","mon","tue","wed","thu"]`.
- Friday: shopping first thing, breakfast at 9am after the shop.
- Saturday: banana pre-parkrun, post-run breakfast, then **lunch and dinner are free** (`free: true` meals).
- Tuesday: badminton 6–7pm, banana at 4:30pm, dinner at 7:15pm.
- Thursday evening: the app should already show next week's shopping list, ready for Friday morning.

---

## 3. Week tracking (important)

David may go on holiday and needs to pick up exactly where he left off. So the app must **never guess the week from the calendar alone**.

Store in D1 (`mp_state`):
- `current_week` (1–3)
- `week_start_date` (the Friday this plan week started)
- `paused` (bool) and `paused_on` (date)

Rules:
- Today's day = days since `week_start_date` (Fri = day 1 … Thu = day 7).
- When a week **finishes** (today is after its Thursday) and the app is not paused, advance once: `current_week` → next in cycle, `week_start_date` += 7.
- Never advance more than one week automatically. If today is more than 7 days past the finished week's Thursday, show a prompt instead: "Looks like you've been away. Carry on with Week N from this Friday, or pick a week?"
- **Pause** button (Settings): freezes everything; home screen shows a "Plan paused" banner and a **Resume** button.
- **Resume**: asks which week to resume (default: the week he paused in) and sets `week_start_date` to the most recent Friday (or next Friday if he prefers).
- **Set week**: manual override any time — choose week 1–3 and the start Friday.

---

## 4. Screens

### 4.1 Today (home)
Shows as soon as the app opens.

- Greeting: **"Welcome, David. It's Monday — Week 2, day 3."**
- **Training** card for today (`days[].training.label`).
- **Meals timeline**: time, meal name, protein/carbs/kcal; tap opens the recipe. Free meals show "Free — try to include some protein".
- **Prep tonight / today**: from `days[].prep`, as tickable items (ticks stored per date).
- **Day totals** vs targets (`meta.targets`): protein, carbs, fat, kcal. Show as simple bars; carbs target uses `training.carbTarget` (low/medium/high).
- On Thursday evening and Friday morning: a prominent **"Shopping — Week N list"** button linking to the list for the week that starts Friday.
- If paused: banner + Resume.

### 4.2 Week
7-day view (Fri → Thu) for the current week; tap a day to see that day like the Today screen. Allow switching to view other weeks (read-only browsing, doesn't change state).

### 4.3 Shopping
Defaults to the **next** week from Thursday evening until the Friday shop is done, otherwise the current week. Week picker at the top.

Sections are aisles, in `aisleOrder`: Fruit & veg, Bakery, Dairy, Meat & fish, Frozen, Cupboard, then Household & extras (`extras`, a fixed list) and Sainsbury's. Within an aisle, sort by `aisleRank`, then name. Eggs sit at the very end of Cupboard.

Every item is tickable (tick = bought) and shows:
- Its `buy` text exactly as given (cupboard and freezer staples without `buy` show the week's amount)
- Fresh items: **"Needs to last until: Thu 29 Oct"**, the date of the last day in `usedOnDays`, counted from the shop date
- Items with `openedPack` (one raw pack cooked on several days): its `note` in small text instead
- Stock-tracked items (`stockTracked: true`: eggs, potatoes, onions, red onions, carrots, garlic, ginger, frozen cod and salmon, sourdough): an "I have ___" input, with **buy = need minus have** rounded up to whole packs. Stock values persist in `mp_stock`.

Nothing is frozen on arrival or defrosted: frozen fish is cooked from frozen and frozen bread is toasted from frozen.

Ticks persist per week-instance (week number + start date) and reset for the next instance. Every tick is keyed by ingredient id (extras by `extra-<id>`); no two items share a key. A "Clear ticks" button.

Nothing on the list is editable in the app: every addition goes through Claude so calories stay capped.

### 4.4 Recipe
- Name, meal type, cook time, macros.
- If `batchCookedOn` is set: note "Batch-cooked on <day> evening".
- If `prepAhead` is set: show it at the top.
- Ingredients with exact quantities and notes.
- Method as numbered steps.

Quantity formatting:
- `g` / `ml` → "150g", "175ml"
- `each`, `head`, `slice`, `tin`, `pouch`, `clove`, `tsp` → use fractions: 0.5 → "½", 0.33 → "⅓", 0.25 → "¼", 0.6 → "½" (round to nearest of ¼ ⅓ ½ ⅔ ¾), e.g. "½ pepper", "1 tin", "½ pouch".
- Pluralise sensibly ("2 eggs", "1 egg").

### 4.5 Settings
- Current week, start date, Pause/Resume, Set week.
- Targets and rules from `meta` (read-only "About my plan").

---

## 5. D1 schema (new tables only)

```sql
CREATE TABLE IF NOT EXISTS mp_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- keys: current_week, week_start_date, paused, paused_on

CREATE TABLE IF NOT EXISTS mp_shopping_ticks (
  week_instance TEXT NOT NULL,      -- e.g. "W2:2026-10-24"
  ingredient_id TEXT NOT NULL,
  ticked INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (week_instance, ingredient_id)
);

CREATE TABLE IF NOT EXISTS mp_stock (
  ingredient_id TEXT PRIMARY KEY,
  qty REAL NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mp_task_ticks (
  date TEXT NOT NULL,               -- YYYY-MM-DD
  task_key TEXT NOT NULL,           -- hash or index of the prep task text
  done INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, task_key)
);
```

Use a numbered migration file. Do not touch existing tables.

---

## 6. `meal-plan-data.json` shape (summary)

```
meta        { title, targets{kcal, protein, fat, fatMinimum, carbs{low,medium,high}}, rules[], notes[] }
dayOrder    ["fri","sat","sun","mon","tue","wed","thu"]
aisleOrder  ["Fruit & veg","Bakery","Dairy","Meat & fish","Frozen","Cupboard","Sainsbury's"]
ingredients [{ id, name, category: fresh|core|pantry|frozen, unit, unitWeight, packSize, packUnit,
               per100g{kcal,protein,carbs,fat}, fridgeDays, openedDays, stockTracked, store, aisle, aisleRank, note }]
recipes     [{ id, name, meal, cookMinutes, ingredients[{ingredient, qty, unit, note?}],
               method[], prepAhead?, batchCookedOn?, macros{kcal,protein,carbs,fat}, tags[] }]
weeks       [{ week: 1|2|3,
               days[{ day, dayName, dayIndex, training{label, carbTarget},
                      meals[{time, slot, recipe|null, free}], prep[], totals{...}, note? }],
               shopping[{ ingredient, name, category, totalQty, unit, packSize, packUnit, stockTracked,
                          buy?, usedOnDays[], openedPack?{openedOn, lastUsedOn, note} }] }]
extras      [{ id, name }]
```

Macros, day totals and shopping quantities are pre-computed from the per-100g values. Don't recalculate them in the app.

---

## 7. Design

- Mobile-first, thumb-friendly, readable at a glance in the kitchen. Large text for quantities.
- Calm, uncluttered. Light and dark mode.
- Today screen must load instantly: no spinners for plan content (it's bundled).
- No microwave and no toaster in David's kitchen: never suggest either. Rice pouches are used cold, straight from the pouch. Toast bread in a dry frying pan, about 3 minutes each side (from frozen is fine).

---

## 8. Done when

- [ ] `legacy-v1` tag and branch exist; D1 export and items JSON are in `archive/`; old tables untouched
- [ ] Opening the app shows today's meals, training and prep for the correct week and day
- [ ] Week advances only after Thursday; Pause, Resume and Set week work; a gap of more than 7 days prompts instead of skipping
- [ ] Shopping list shows the right week, "needs to last until" dates, freeze-on-arrival lines, and staples maths from stock counts
- [ ] Ticks and stock counts persist across devices
- [ ] Recipes show exact quantities with fractions and numbered methods
- [ ] Works well on a phone
