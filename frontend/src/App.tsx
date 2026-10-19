import { useEffect } from 'react'
import { useAuth, AuthProvider } from '@/context/AuthContext'
import { PlanProvider } from '@/context/PlanContext'
import { useOnline } from '@/hooks/useOnline'
import { useRoute } from '@/hooks/useRoute'
import { flush } from '@/services/sync'
import { PinEntry } from '@/components/PinEntry/PinEntry'
import { OfflineIndicator } from '@/components/OfflineIndicator/OfflineIndicator'
import { TabBar } from '@/components/TabBar/TabBar'
import { Today } from '@/screens/Today'
import { WeekScreen } from '@/screens/WeekScreen'
import { DayScreen } from '@/screens/DayScreen'
import { Shopping } from '@/screens/Shopping'
import { RecipeScreen } from '@/screens/RecipeScreen'
import { Settings } from '@/screens/Settings'
import styles from './App.module.css'

function MealPlan() {
  const route = useRoute()
  const online = useOnline()

  // Send anything ticked while offline in an earlier session.
  useEffect(() => {
    void flush()
  }, [])

  return (
    <div className={styles.container}>
      <OfflineIndicator isOffline={!online} />
      {route.name === 'today' && <Today />}
      {route.name === 'week' && <WeekScreen week={route.week} />}
      {route.name === 'day' && <DayScreen week={route.week} day={route.day} />}
      {route.name === 'shopping' && <Shopping />}
      {route.name === 'recipe' && <RecipeScreen id={route.id} />}
      {route.name === 'settings' && <Settings />}
      <TabBar route={route} />
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

  return (
    <PlanProvider>
      <MealPlan />
    </PlanProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
