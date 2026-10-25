import { describe, expect, it } from 'vitest'
import { TICK_KEY_RE, extraTickKey } from '@shared/ticks'
import { getIngredient, getRecipe, plan } from './data'

describe('meal-plan-data.json', () => {
  const linkedRecipes = plan.weeks.flatMap(w =>
    w.days.flatMap(d => d.prep.flatMap(p => (typeof p === 'string' ? [] : [p.recipe])))
  )

  it('links every batch-cook prep line to a recipe that exists', () => {
    for (const id of linkedRecipes) expect(getRecipe(id), id).toBeDefined()
  })

  it('links every batch-cook recipe from a prep line', () => {
    const batch = plan.recipes.filter(r => r.meal === 'batch').map(r => r.id)
    expect(batch.sort()).toEqual([...new Set(linkedRecipes)].sort())
  })

  it('uses only known ingredients and recipes', () => {
    for (const r of plan.recipes) for (const i of r.ingredients) expect(getIngredient(i.ingredient), i.ingredient).toBeDefined()
    for (const w of plan.weeks) for (const d of w.days) for (const m of d.meals) {
      if (m.recipe) expect(getRecipe(m.recipe), m.recipe).toBeDefined()
    }
  })
})

describe('extras', () => {
  it('have unique tick-safe ids, in alphabetical order', () => {
    const ids = plan.extras.map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    const names = plan.extras.map(e => e.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en-GB', { sensitivity: 'base' })))
  })
})

describe('shopping tick keys', () => {
  const keys = [
    ...new Set(plan.weeks.flatMap(w => w.shopping.map(s => s.ingredient))),
    ...plan.extras.map(e => extraTickKey(e.id)),
  ]

  it('are accepted by the worker', () => {
    for (const key of keys) expect(key, key).toMatch(TICK_KEY_RE)
  })

  it('are unique, even ignoring case, so no two items tick together', () => {
    const lower = keys.map(k => k.toLowerCase())
    expect(new Set(lower).size).toBe(keys.length)
  })

  it('give white and brown rice pouches their own keys', () => {
    expect(keys).toContain('riceW')
    expect(keys).toContain('riceB')
  })
})

describe('daily nuts', () => {
  it('come straight after lunch every day, Saturday included', () => {
    for (const w of plan.weeks) for (const d of w.days) {
      const lunch = d.meals.findIndex(m => m.slot === 'lunch')
      expect(d.meals[lunch + 1]?.recipe, `W${w.week} ${d.day}`).toBe('daily-nuts')
    }
  })
})

describe('recipe labels', () => {
  it('match the slot the recipe is eaten in', () => {
    for (const w of plan.weeks) for (const d of w.days) for (const m of d.meals) {
      if (m.recipe) expect(getRecipe(m.recipe)?.meal, `${m.recipe} on W${w.week} ${d.day}`).toBe(m.slot)
    }
  })
})

// Guards hand edits to meal-plan-data.json: run scripts/recompute-plan.py after changing recipes.
describe('pre-computed numbers', () => {
  const ingredient = (id: string) => getIngredient(id)!
  const grams = (id: string, qty: number, unit: string) =>
    unit === 'g' || unit === 'ml' ? qty : qty * (ingredient(id).unitWeight ?? 0)

  it('recipe macros match the per-100g values', () => {
    for (const r of plan.recipes) {
      if (!r.macros) continue
      for (const k of ['kcal', 'protein', 'carbs', 'fat'] as const) {
        const sum = r.ingredients.reduce((t, x) => t + (grams(x.ingredient, x.qty, x.unit) * ingredient(x.ingredient).per100g[k]) / 100, 0)
        expect(Math.abs(Math.round(sum) - r.macros[k]), `${r.id} ${k}`).toBeLessThanOrEqual(1)
      }
    }
  })

  it('day totals add up the day’s meals', () => {
    for (const w of plan.weeks) for (const d of w.days) {
      for (const k of ['kcal', 'protein', 'carbs', 'fat'] as const) {
        const sum = d.meals.reduce((t, m) => t + (m.recipe ? getRecipe(m.recipe)!.macros![k] : 0), 0)
        expect(sum, `W${w.week} ${d.day} ${k}`).toBe(d.totals[k])
      }
    }
  })

  it('shopping quantities add up the week’s recipes', () => {
    for (const w of plan.weeks) {
      const need = new Map<string, number>()
      for (const d of w.days) for (const m of d.meals) {
        if (!m.recipe) continue
        for (const x of getRecipe(m.recipe)!.ingredients) need.set(x.ingredient, (need.get(x.ingredient) ?? 0) + x.qty)
      }
      expect(new Set(w.shopping.map(s => s.ingredient)), `W${w.week}`).toEqual(new Set(need.keys()))
      for (const s of w.shopping) expect(Math.abs(s.totalQty - need.get(s.ingredient)!), `W${w.week} ${s.ingredient}`).toBeLessThan(0.01)
    }
  })
})
