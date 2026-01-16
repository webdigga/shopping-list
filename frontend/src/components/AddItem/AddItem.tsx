import { useState, useRef } from 'react'
import { Plus } from 'lucide-react'
import styles from './AddItem.module.css'

interface AddItemProps {
  onAdd: (name: string) => Promise<void>
}

export function AddItem({ onAdd }: AddItemProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = value.trim()
    if (!trimmed || loading) return

    setLoading(true)
    await onAdd(trimmed)
    setLoading(false)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add an item..."
        className={styles.input}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
      <button
        type="submit"
        className={styles.button}
        disabled={!value.trim() || loading}
        aria-label="Add item"
      >
        {loading ? (
          <span className={styles.spinner} />
        ) : (
          <Plus size={24} strokeWidth={2.5} />
        )}
      </button>
    </form>
  )
}
