// The plan is static and bundled, so screens render it with no loading state.
import raw from '@data/meal-plan-data.json'
import type { DayKey, Ingredient, PlanData, Recipe, Week, WeekNumber } from '@shared/planTypes'

export const plan = raw as unknown as PlanData

const recipes = new Map<string, Recipe>(plan.recipes.map(r => [r.id, r]))
const ingredients = new Map<string, Ingredient>(plan.ingredients.map(i => [i.id, i]))
const weeks = new Map<WeekNumber, Week>(plan.weeks.map(w => [w.week, w]))

export function getRecipe(id: string): Recipe | undefined {
  return recipes.get(id)
}

export function getIngredient(id: string): Ingredient | undefined {
  return ingredients.get(id)
}

export function getWeek(week: WeekNumber): Week {
  const found = weeks.get(week)
  if (!found) throw new Error(`Week ${week} missing from meal-plan-data.json`)
  return found
}

export function dayIndex(day: DayKey): number {
  return plan.dayOrder.indexOf(day)
}
