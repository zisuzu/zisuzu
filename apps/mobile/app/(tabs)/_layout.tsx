import { Tabs } from 'expo-router'
import { colors } from '../../constants/theme'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.gray100,
          backgroundColor: colors.white,
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen name="feed"       options={{ title: 'Explore',    tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} /> }} />
      <Tabs.Screen name="chats"      options={{ title: 'Chats',      tabBarIcon: ({ color }) => <TabIcon name="💬" color={color} /> }} />
      <Tabs.Screen name="create"     options={{ title: 'Create',     tabBarIcon: ({ color }) => <TabIcon name="＋" color={color} /> }} />
      <Tabs.Screen name="activities" options={{ title: 'Mine',       tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} /> }} />
      <Tabs.Screen name="profile"    options={{ title: 'Profile',    tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} /> }} />
    </Tabs>
  )
}

function TabIcon({ name, color }: { name: string; color: string }) {
  return null // Replace with actual icons (e.g. @expo/vector-icons) in next iteration
}

