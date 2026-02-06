import { useState, useRef, useEffect } from 'react'
import { Lock, ShoppingCart } from 'lucide-react'
import styles from './PinEntry.module.css'

interface PinEntryProps {
  mode: 'login' | 'setup'
  onSubmit: (pin: string) => Promise<{ success: boolean; error?: string }>
}

export function PinEntry({ mode, onSubmit }: PinEntryProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [step])

  const handlePinChange = (value: string, isConfirm = false) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6)

    if (isConfirm) {
      setConfirmPin(cleaned)
    } else {
      setPin(cleaned)
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    if (mode === 'setup' && step === 'enter') {
      setStep('confirm')
      return
    }

    if (mode === 'setup' && step === 'confirm') {
      if (pin !== confirmPin) {
        setError('PINs do not match')
        setConfirmPin('')
        return
      }
    }

    setLoading(true)
    const result = await onSubmit(pin)
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Invalid PIN')
      setPin('')
      setConfirmPin('')
      if (mode === 'setup') {
        setStep('enter')
      }
    }
  }

  const currentPin = step === 'confirm' ? confirmPin : pin
  const showConfirm = mode === 'setup' && step === 'confirm'

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <ShoppingCart size={32} />
        </div>

        <h1 className={styles.title}>Shopping List</h1>

        <p className={styles.subtitle}>
          {mode === 'setup'
            ? showConfirm
              ? 'Confirm your PIN'
              : 'Create a PIN to protect your list'
            : 'Enter your PIN to continue'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div
            className={styles.pinDisplay}
            onClick={() => inputRef.current?.focus()}
          >
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`${styles.pinDot} ${currentPin.length > i ? styles.filled : ''}`}
              />
            ))}
          </div>

          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={currentPin}
            onChange={e => handlePinChange(e.target.value, showConfirm)}
            className={styles.hiddenInput}
            autoComplete="one-time-code"
            autoFocus
          />

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.button}
            disabled={loading || currentPin.length < 4}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <Lock size={18} />
                {mode === 'setup'
                  ? showConfirm
                    ? 'Create PIN'
                    : 'Next'
                  : 'Unlock'}
              </>
            )}
          </button>
        </form>

        {mode === 'setup' && step === 'confirm' && (
          <button
            type="button"
            className={styles.backButton}
            onClick={() => {
              setStep('enter')
              setConfirmPin('')
              setError('')
            }}
          >
            Go back
          </button>
        )}
      </div>
    </div>
  )
}
