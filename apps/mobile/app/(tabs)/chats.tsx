import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { borderRadius, colors, spacing, typography } from '../../constants/theme'

type ChatThread = {
  id: string
  activity_id: string
  last_message_at: string | null
  activities: {
    id: string
    title: string
    status: string
  }
}

export default function ChatsTabScreen() {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('activity_conversations')
      .select('id, activity_id, last_message_at, activities!inner(id, title, status)')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50)

    if (!error) {
      setThreads((data as ChatThread[]) ?? [])
    }

    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <Text style={styles.subtitle}>Conversations from your joined activities.</Text>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>No chat threads yet. Join an activity first.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`../screens/ActivityChatScreen?id=${item.activity_id}`)}
          >
            <Text style={styles.cardTitle}>{item.activities.title}</Text>
            <Text style={styles.cardStatus}>Status: {item.activities.status}</Text>
            <Text style={styles.cardTime}>
              {item.last_message_at
                ? `Updated ${formatDistanceToNow(new Date(item.last_message_at), { addSuffix: true })}`
                : 'No messages yet'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.white, padding: spacing.md, gap: spacing.xs },
  title: { fontSize: typography.fontSize2Xl, fontWeight: '700', color: colors.gray900 },
  subtitle: { fontSize: typography.fontSizeSm, color: colors.gray500 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  cardTitle: { fontSize: typography.fontSizeLg, fontWeight: '600', color: colors.gray900 },
  cardStatus: { marginTop: spacing.xs, fontSize: typography.fontSizeSm, color: colors.gray600 },
  cardTime: { marginTop: spacing.xs, fontSize: typography.fontSizeSm, color: colors.gray500 },
  empty: { textAlign: 'center', marginTop: spacing.xl, color: colors.gray400 },
})

