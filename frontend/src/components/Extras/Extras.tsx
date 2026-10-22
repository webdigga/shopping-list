import { useState, type FormEvent } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { EXTRA_NAME_MAX, extraTickKey } from '@shared/extras'
import { useExtras } from '@/hooks/usePlanData'
import { cleanExtraName, type ExtraItem } from '@/plan/extras'
import ui from '@/styles/ui.module.css'
import styles from './Extras.module.css'

interface ExtrasProps {
  ticks: Record<string, true>
  onTick: (key: string, ticked: boolean) => void
}

/** Household items and other everyday extras: on the list every week, editable in place. */
export function Extras({ ticks, onTick }: ExtrasProps) {
  const { extras, saveExtra, deleteExtra } = useExtras()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [newName, setNewName] = useState('')

  const startEdit = (item: ExtraItem) => {
    setEditing(item.id)
    setDraft(item.name)
  }

  const save = (id: string) => {
    const name = cleanExtraName(draft)
    if (!name) return
    saveExtra({ id, name })
    setEditing(null)
  }

  const remove = (item: ExtraItem) => {
    if (!window.confirm(`Delete "${item.name}" from the list?`)) return
    deleteExtra(item.id)
    setEditing(null)
  }

  const add = (e: FormEvent) => {
    e.preventDefault()
    const name = cleanExtraName(newName)
    if (!name) return
    saveExtra({ id: crypto.randomUUID(), name })
    setNewName('')
  }

  return (
    <section className={ui.section} aria-labelledby="extras">
      <h2 id="extras" className={ui.sectionTitle}>Household &amp; extras</h2>
      <p className={ui.muted}>On the list every week. Tap the pencil to rename or delete.</p>
      <ul className={ui.list} data-testid="extras">
        {extras.map(item => {
          if (editing === item.id) {
            return (
              <li key={item.id} className={styles.editRow}>
                <input
                  className={ui.input}
                  value={draft}
                  maxLength={EXTRA_NAME_MAX}
                  aria-label="Item name"
                  autoFocus
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') save(item.id)
                    if (e.key === 'Escape') setEditing(null)
                  }}
                />
                <div className={ui.buttonRow}>
                  <button type="button" className={ui.button} onClick={() => save(item.id)} disabled={!cleanExtraName(draft)}>
                    Save
                  </button>
                  <button type="button" className={ui.buttonSecondary} onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                  <button type="button" className={styles.delete} onClick={() => remove(item)}>
                    Delete
                  </button>
                </div>
              </li>
            )
          }
          const key = extraTickKey(item.id)
          const ticked = !!ticks[key]
          return (
            <li key={item.id} className={styles.row}>
              <label className={`${ui.check} ${styles.rowCheck} ${ticked ? ui.checkDone : ''}`}>
                <input type="checkbox" checked={ticked} onChange={e => onTick(key, e.target.checked)} />
                <span className={ui.checkBody}>
                  <span className={ui.checkMain}>{item.name}</span>
                </span>
              </label>
              <button type="button" className={styles.edit} aria-label={`Edit ${item.name}`} onClick={() => startEdit(item)}>
                <Pencil size={18} aria-hidden />
              </button>
            </li>
          )
        })}
        <li>
          <form className={styles.addRow} onSubmit={add}>
            <input
              className={`${ui.input} ${styles.addInput}`}
              value={newName}
              maxLength={EXTRA_NAME_MAX}
              placeholder="Add an item"
              aria-label="New item"
              onChange={e => setNewName(e.target.value)}
            />
            <button type="submit" className={ui.button} disabled={!cleanExtraName(newName)}>
              <Plus size={18} aria-hidden />
              Add
            </button>
          </form>
        </li>
      </ul>
    </section>
  )
}
