import { useState } from 'react'
import { usePlan } from '@/context/PlanContext'
import { plan } from '@/plan/data'
import { formatLongDate } from '@/plan/format'
import { WeekForm } from '@/components/WeekForm/WeekForm'
import ui from '@/styles/ui.module.css'
import styles from './Settings.module.css'

export function Settings() {
  const { view, error, setWeek, pause } = usePlan()
  const [form, setForm] = useState<'set' | 'resume' | null>(null)
  const state = view.mode === 'setup' ? null : view.state
  const { targets } = plan.meta

  return (
    <main className={ui.page}>
      <h1 className={ui.pageTitle}>Settings</h1>

      {error && <p className={ui.error} role="alert">{error}</p>}

      <section className={`${ui.card} ${ui.section}`} aria-labelledby="my-week">
        <h2 id="my-week" className={ui.sectionTitle}>My week</h2>
        {state ? (
          <dl className={styles.facts}>
            <div><dt>Current week</dt><dd>Week {state.currentWeek}</dd></div>
            <div><dt>Started</dt><dd>{formatLongDate(state.weekStartDate)}</dd></div>
            <div>
              <dt>Status</dt>
              <dd>{state.paused ? `Paused${state.pausedOn ? ` since ${formatLongDate(state.pausedOn)}` : ''}` : 'Running'}</dd>
            </div>
          </dl>
        ) : (
          <p className={ui.muted}>No week set yet.</p>
        )}

        {form ? (
          <WeekForm
            today={view.today}
            defaultWeek={state?.currentWeek ?? 1}
            submitLabel={form === 'resume' ? 'Resume' : 'Save'}
            onSubmit={setWeek}
            onCancel={() => setForm(null)}
          />
        ) : (
          <div className={ui.buttonRow}>
            {state?.paused ? (
              <button className={ui.button} onClick={() => setForm('resume')}>Resume</button>
            ) : (
              state && <button className={ui.buttonSecondary} onClick={() => void pause()}>Pause plan</button>
            )}
            <button className={ui.buttonSecondary} onClick={() => setForm('set')}>Set week</button>
          </div>
        )}
      </section>

      <section className={`${ui.card} ${ui.section}`} aria-labelledby="about">
        <h2 id="about" className={ui.sectionTitle}>About my plan</h2>
        <dl className={styles.facts}>
          <div><dt>Calories</dt><dd>{targets.kcal} kcal</dd></div>
          <div><dt>Protein</dt><dd>{targets.protein}g</dd></div>
          <div><dt>Fat</dt><dd>{targets.fat}g (at least {targets.fatMinimum}g)</dd></div>
          <div>
            <dt>Carbs</dt>
            <dd>{targets.carbs.low}g low, {targets.carbs.medium}g medium, {targets.carbs.high}g high days</dd>
          </div>
        </dl>

        <h3 className={ui.subTitle}>Rules</h3>
        <ul className={styles.bullets}>
          {plan.meta.rules.map(rule => <li key={rule}>{rule}</li>)}
        </ul>

        <h3 className={ui.subTitle}>Notes</h3>
        <ul className={styles.bullets}>
          {plan.meta.notes.map(note => <li key={note}>{note}</li>)}
        </ul>
      </section>
    </main>
  )
}
