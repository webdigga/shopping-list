// Types for meal-plan-data.json (the plan's source of truth, bundled at build time).

export type DayKey = 'fri' | 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu'
export type WeekNumber = 1 | 2 | 3
export type CarbTarget = 'low' | 'medium' | 'high'
export type Category = 'fresh' | 'core' | 'pantry' | 'frozen'

export interface Macros {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface Ingredient {
  id: string
  name: string
  category: Category
  unit: string
  unitWeight: number | null
  packSize: number | null
  packUnit: string
  per100g: Macros
  fridgeDays: number | null
  openedDays: number | null
  stockTracked: boolean
  store: string
  /** Shopping list section; one of PlanData.aisleOrder. */
  aisle: string
  /** Order within the aisle (lower first); ties sort by name. */
  aisleRank: number
  note: string | null
}

export interface RecipeIngredient {
  ingredient: string
  qty: number
  unit: string
  note?: string
}

export interface Recipe {
  id: string
  name: string
  meal: string
  /** How many portions the ingredients make. */
  servingsCooked: number
  cookMinutes: number
  ingredients: RecipeIngredient[]
  method: string[]
  prepAhead?: string | null
  batchCookedOn?: DayKey | null
  /** Left out on batch-cook recipes, which are eaten through other meals. */
  macros?: Macros
  tags: string[]
}

export interface Meal {
  time: string
  slot: string
  recipe: string | null
  free: boolean
}

/** A prep line; batch cooks link to the recipe that explains them. */
export type PrepTask = string | { text: string; recipe: string }

export interface Day {
  day: DayKey
  dayName: string
  dayIndex: number
  training: { label: string; carbTarget: CarbTarget }
  meals: Meal[]
  prep: PrepTask[]
  totals: Macros
  note?: string | null
}

/** One raw pack (meat, smoked salmon) cooked on several days of the week. */
export interface OpenedPack {
  openedOn: DayKey
  lastUsedOn: DayKey
  note: string
}

export interface ShoppingItem {
  ingredient: string
  name: string
  category: Category
  totalQty: number
  unit: string
  packSize: number | null
  packUnit: string
  stockTracked: boolean
  buy?: string
  usedOnDays: DayKey[]
  openedPack?: OpenedPack
}

export interface Week {
  week: WeekNumber
  days: Day[]
  shopping: ShoppingItem[]
}

/** Household items and other everyday extras: on the shopping list every week. */
export interface ExtraItem {
  id: string
  name: string
}

export interface PlanData {
  meta: {
    title: string
    targets: {
      kcal: number
      protein: number
      fat: number
      fatMinimum: number
      carbs: Record<CarbTarget, number>
    }
    rules: string[]
    notes: string[]
  }
  dayOrder: DayKey[]
  /** Shopping list sections in walking order. */
  aisleOrder: string[]
  ingredients: Ingredient[]
  recipes: Recipe[]
  weeks: Week[]
  extras: ExtraItem[]
}
