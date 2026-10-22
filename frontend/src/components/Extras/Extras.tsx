import { plan } from '@/plan/data'
import { extraTickKey } from '@/plan/extras'
import ui from '@/styles/ui.module.css'

interface ExtrasProps {
  ticks: Record<string, true>
  onTick: (key: string, ticked: boolean) => void
}

/** Household items and other everyday extras. Fixed in the plan data, so every addition is agreed first. */
export function Extras({ ticks, onTick }: ExtrasProps) {
  return (
    <section className={ui.section} aria-labelledby="extras">
      <h2 id="extras" className={ui.sectionTitle}>Household &amp; extras</h2>
      <ul className={ui.list} data-testid="extras">
        {plan.extras.map(item => {
          const key = extraTickKey(item.id)
          const ticked = !!ticks[key]
          return (
            <li key={item.id}>
              <label className={`${ui.check} ${ticked ? ui.checkDone : ''}`}>
                <input type="checkbox" checked={ticked} onChange={e => onTick(key, e.target.checked)} />
                <span className={ui.checkBody}>
                  <span className={ui.checkMain}>{item.name}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
