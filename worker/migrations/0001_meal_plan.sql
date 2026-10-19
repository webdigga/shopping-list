-- Meal plan app tables. The legacy tables (items, settings, sessions) are left untouched.

CREATE TABLE IF NOT EXISTS mp_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- keys: current_week, week_start_date, paused, paused_on

CREATE TABLE IF NOT EXISTS mp_shopping_ticks (
  week_instance TEXT NOT NULL,      -- e.g. "W2:2026-10-23"
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
  task_key TEXT NOT NULL,           -- hash of the prep task text
  done INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, task_key)
);
