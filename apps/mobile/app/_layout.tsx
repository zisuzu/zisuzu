import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { queryClient } from '../lib/queryClient'
import { useSession } from '../hooks/useSession'

function RootLayoutNav() {
  const { session, loading } = useSession()

  useEffect(() => {
    if (loading) return
    if (!session) {
      router.replace('/(auth)/welcome')
    } else {
      router.replace('/(tabs)/feed')
    }
  }, [session, loading])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="screens/ActivityDetailScreen" options={{ presentation: 'card' }} />
      <Stack.Screen name="screens/ActivityChatScreen" options={{ presentation: 'card' }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

