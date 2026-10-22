import { describe, expect, it } from 'vitest'
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
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]{1,57}$/)
    const names = plan.extras.map(e => e.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en-GB', { sensitivity: 'base' })))
  })
})
