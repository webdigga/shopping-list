import { useEffect, useRef, useState } from 'react'
import { usePlan } from '@/context/PlanContext'
import { markPrepSeen, prepToShow, readPrepSeen } from '@/plan/prepReminder'
import { PrepList } from '@/components/DayPlan/DayPlan'
import ui from '@/styles/ui.module.css'
import styles from './PrepReminder.module.css'

/** Pops up today's prep jobs the first time the app opens each day, until dismissed. */
export function PrepReminder() {
  const { view } = usePlan()
  const [seenOn, setSeenOn] = useState(readPrepSeen)
  const dialog = useRef<HTMLDialogElement>(null)
  const day = prepToShow(view, seenOn)

  useEffect(() => {
    if (day && dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [day])

  if (!day) return null

  const dismiss = () => {
    markPrepSeen(view.today)
    setSeenOn(view.today)
  }
  const jobs = day.prep.length

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="prep-reminder-title"
      onClose={dismiss}
      data-testid="prep-reminder"
    >
      <h2 id="prep-reminder-title" className={ui.bannerTitle}>
        Prep today and tonight ({jobs} {jobs === 1 ? 'job' : 'jobs'})
      </h2>
      <PrepList prep={day.prep} onNavigate={dismiss} />
      <button className={`${ui.button} ${ui.buttonBlock}`} onClick={dismiss}>Got it</button>
    </dialog>
  )
}
