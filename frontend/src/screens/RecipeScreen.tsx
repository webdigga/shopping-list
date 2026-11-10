import { ChevronLeft, Clock } from 'lucide-react'
import type { RecipeIngredient } from '@shared/planTypes'
import { getIngredient, getRecipe } from '@/plan/data'
import { dayName, formatAmount, slotLabel } from '@/plan/format'
import ui from '@/styles/ui.module.css'
import styles from './RecipeScreen.module.css'

/** Marks a portion's share of a batch on the meal's own ingredient list. */
const BATCH_COOKED = 'batch-cooked'

function goBack() {
  if (window.history.length > 1) window.history.back()
  else window.location.hash = '#/today'
}

function Ingredients({ id, title, items }: { id: string; title: string; items: RecipeIngredient[] }) {
  return (
    <section className={ui.section} aria-labelledby={id}>
      <h2 id={id} className={ui.sectionTitle}>{title}</h2>
      <ul className={ui.list}>
        {items.map((item, i) => {
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
  )
}

function Method({ id, title, steps }: { id: string; title: string; steps: string[] }) {
  return (
    <section className={ui.section} aria-labelledby={id}>
      <h2 id={id} className={ui.sectionTitle}>{title}</h2>
      <ol className={styles.method}>
        {steps.map((step, i) => (
          <li key={i}>
            <span className={styles.stepNumber} aria-hidden>{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
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
  // On a batch-cook day the page leads with the whole batch, so the doubled amounts come first.
  const batch = recipe.cooksBatch ? getRecipe(recipe.cooksBatch) : undefined
  const portions = batch?.servingsCooked ?? recipe.servingsCooked
  const extras = batch ? recipe.ingredients.filter(i => i.note !== BATCH_COOKED) : []

  return (
    <main className={ui.page}>
      <button className={ui.backLink} onClick={goBack}><ChevronLeft size={20} aria-hidden />Back</button>

      <header className={styles.header}>
        <p className={ui.sectionTitle}>{slotLabel(recipe.meal)}</p>
        <h1 className={ui.pageTitle}>{recipe.name}</h1>
        <p className={styles.time}>
          <Clock size={16} aria-hidden /> {(batch ?? recipe).cookMinutes} min · makes {portions}{' '}
          {portions === 1 ? 'portion' : 'portions'}
        </p>
      </header>

      {batch && (
        <p className={ui.banner} data-testid="double-batch">
          <strong>Double batch today:</strong> this makes {portions} portions, one now and one for later in the week.
          Use the amounts below.
        </p>
      )}
      {recipe.prepAhead && (
        <p className={ui.banner} data-testid="prep-ahead"><strong>Prep ahead:</strong> {recipe.prepAhead}</p>
      )}
      {recipe.batchCookedOn && !batch && (
        <p className={styles.batch}>Batch-cooked on {dayName(recipe.batchCookedOn)}</p>
      )}

      {macros && (
        <dl className={`${ui.card} ${styles.macros}`}>
          <div><dt>Protein</dt><dd>{macros.protein}g</dd></div>
          <div><dt>Carbs</dt><dd>{macros.carbs}g</dd></div>
          <div><dt>Fat</dt><dd>{macros.fat}g</dd></div>
          <div><dt>kcal</dt><dd>{macros.kcal}</dd></div>
        </dl>
      )}

      {batch ? (
        <>
          <Ingredients id="batch-ingredients" title="Double batch ingredients" items={batch.ingredients} />
          <Method id="batch-method" title="Double batch method" steps={batch.method} />
          {extras.length > 0 && <Ingredients id="ingredients" title="Also for this meal" items={extras} />}
          <Method id="method" title="To serve" steps={recipe.method} />
        </>
      ) : (
        <>
          <Ingredients id="ingredients" title="Ingredients" items={recipe.ingredients} />
          <Method id="method" title="Method" steps={recipe.method} />
        </>
      )}
    </main>
  )
}
