import { useAuth, AuthProvider } from '@/context/AuthContext'
import { useItems } from '@/hooks/useItems'
import { PinEntry } from '@/components/PinEntry/PinEntry'
import { AddItem } from '@/components/AddItem/AddItem'
import { ItemList } from '@/components/ItemList/ItemList'
import { OfflineIndicator } from '@/components/OfflineIndicator/OfflineIndicator'
import styles from './App.module.css'

function ShoppingList() {
  const { items, loading, error, isOffline, addItem, toggleItem, deleteItem, clearAll } = useItems()

  const hasCompleted = items.some(i => i.completed)

  const handleClearAll = () => {
    if (window.confirm('Uncheck all completed items?')) {
      clearAll()
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading list...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <OfflineIndicator isOffline={isOffline} />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Shopping List</h1>
          <span className={styles.count}>
            {items.filter(i => !i.completed).length} items
          </span>
        </header>

        {hasCompleted && (
          <button className={styles.clearAll} onClick={handleClearAll}>
            Uncheck All
          </button>
        )}

        <AddItem onAdd={addItem} />

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <ItemList
          items={items}
          onToggle={toggleItem}
          onDelete={deleteItem}
        />

      </main>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading, needsSetup, login, setupPin } = useAuth()

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (!isAuthenticated) {
    if (needsSetup) {
      return <PinEntry mode="setup" onSubmit={setupPin} />
    }
    return <PinEntry mode="login" onSubmit={login} />
  }

  return <ShoppingList />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
