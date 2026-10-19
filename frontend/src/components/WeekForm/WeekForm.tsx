import { useState } from 'react'
import { isFriday, mostRecentFriday, nextFriday } from '@shared/weekState'
import type { WeekNumber } from '@shared/planTypes'
import { formatShortDate } from '@/plan/format'
import ui from '@/styles/ui.module.css'
import styles from './WeekForm.module.css'

interface WeekFormProps {
  today: string
  defaultWeek: WeekNumber
  /** Preselected start Friday; falls back to the most recent Friday. */
  defaultStart?: string
  submitLabel: string
  onSubmit: (week: WeekNumber, startDate: string) => Promise<boolean>
  onCancel?: () => void
}

/** Pick a week (1 to 3) and the Friday it starts: used by Set week, Resume and the away prompt. */
export function WeekForm({ today, defaultWeek, defaultStart, submitLabel, onSubmit, onCancel }: WeekFormProps) {
  const recent = mostRecentFriday(today)
  const next = nextFriday(today)
  const [week, setWeek] = useState<WeekNumber>(defaultWeek)
  const [start, setStart] = useState(defaultStart === next ? next : recent)
  const [saving, setSaving] = useState(false)

  const starts = [
    { value: recent, label: isFriday(today) ? `Today, ${formatShortDate(recent)}` : `Last Friday, ${formatShortDate(recent)}` },
    { value: next, label: `Next Friday, ${formatShortDate(next)}` },
  ]

  const submit = async () => {
    setSaving(true)
    const ok = await onSubmit(week, start)
    setSaving(false)
    if (ok) onCancel?.()
  }

  return (
    <div className={styles.form}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Week</legend>
        <div className={styles.segments}>
          {([1, 2, 3] as WeekNumber[]).map(w => (
            <button
              key={w}
              type="button"
              className={`${styles.segment} ${w === week ? styles.selected : ''}`}
              aria-pressed={w === week}
              onClick={() => setWeek(w)}
            >
              Week {w}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Starting</legend>
        <div className={styles.segments}>
          {starts.map(s => (
            <button
              key={s.value}
              type="button"
              className={`${styles.segment} ${s.value === start ? styles.selected : ''}`}
              aria-pressed={s.value === start}
              onClick={() => setStart(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={ui.buttonRow}>
        <button type="button" className={ui.button} onClick={submit} disabled={saving}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={ui.buttonSecondary} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
