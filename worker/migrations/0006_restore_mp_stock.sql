-- Staple stock counts are back: stock-tracked items (onions, frozen fish, sourdough...) have an "I have" input.
CREATE TABLE IF NOT EXISTS mp_stock (
  ingredient_id TEXT PRIMARY KEY,
  qty REAL NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
