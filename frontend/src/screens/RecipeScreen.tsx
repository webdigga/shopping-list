import { ChevronLeft, Clock } from 'lucide-react'
import { getIngredient, getRecipe } from '@/plan/data'
import { dayName, formatAmount, slotLabel } from '@/plan/format'
import ui from '@/styles/ui.module.css'
import styles from './RecipeScreen.module.css'

function goBack() {
  if (window.history.length > 1) window.history.back()
  else window.location.hash = '#/today'
}

export function RecipeScreen({ id }: { id: string }) {
  const recipe = getRecipe(id)

  if (!recipe) {
    return (
      <main className={ui.page}>
        <button className={ui.backLink} onClick={goBack}><ChevronLeft size={20} aria-hidden />Back</button>
        <p>Recipe not found.</p>
      </main>
    )
  }

  const { macros } = recipe

  return (
    <main className={ui.page}>
      <button className={ui.backLink} onClick={goBack}><ChevronLeft size={20} aria-hidden />Back</button>

      <header className={styles.header}>
        <p className={ui.sectionTitle}>{slotLabel(recipe.meal)}</p>
        <h1 className={ui.pageTitle}>{recipe.name}</h1>
        <p className={styles.time}>
          <Clock size={16} aria-hidden /> {recipe.cookMinutes} min · makes {recipe.servingsCooked}{' '}
          {recipe.servingsCooked === 1 ? 'portion' : 'portions'}
        </p>
      </header>

      {recipe.prepAhead && (
        <p className={ui.banner} data-testid="prep-ahead"><strong>Prep ahead:</strong> {recipe.prepAhead}</p>
      )}
      {recipe.batchCookedOn && (
        <p className={styles.batch}>Batch-cooked on {dayName(recipe.batchCookedOn)} evening</p>
      )}

      {macros && (
        <dl className={`${ui.card} ${styles.macros}`}>
          <div><dt>Protein</dt><dd>{macros.protein}g</dd></div>
          <div><dt>Carbs</dt><dd>{macros.carbs}g</dd></div>
          <div><dt>Fat</dt><dd>{macros.fat}g</dd></div>
          <div><dt>kcal</dt><dd>{macros.kcal}</dd></div>
        </dl>
      )}

      <section className={ui.section} aria-labelledby="ingredients">
        <h2 id="ingredients" className={ui.sectionTitle}>Ingredients</h2>
        <ul className={ui.list}>
          {recipe.ingredients.map((item, i) => {
            const ingredient = getIngredient(item.ingredient)
            return (
              <li key={i} className={styles.ingredient}>
                <span className={styles.amount}>{formatAmount(item.qty, item.unit, ingredient)}</span>
                <span className={styles.ingredientBody}>
                  <span>{ingredient?.name ?? item.ingredient}</span>
                  {item.note && <span className={ui.muted}>{item.note}</span>}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={ui.section} aria-labelledby="method">
        <h2 id="method" className={ui.sectionTitle}>Method</h2>
        <ol className={styles.method}>
          {recipe.method.map((step, i) => (
            <li key={i}>
              <span className={styles.stepNumber} aria-hidden>{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
