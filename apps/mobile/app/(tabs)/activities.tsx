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
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { borderRadius, colors, spacing, typography } from '../../constants/theme'

type MyActivity = {
  activity_id: string
  role: string
  activities: {
    id: string
    title: string
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
    start_time: string
    max_participants: number
  }
}

export default function MyActivitiesScreen() {
  const [items, setItems] = useState<MyActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('activity_participants')
      .select('activity_id, role, activities!inner(id, title, status, start_time, max_participants)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false })

    if (!error) {
      setItems((data as MyActivity[]) ?? [])
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
        <Text style={styles.title}>My Activities</Text>
        <Text style={styles.subtitle}>Activities you've joined or host.</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.activity_id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>You have not joined any activities yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`../screens/ActivityDetailScreen?id=${item.activity_id}`)}
          >
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{item.activities.title}</Text>
              <Text style={styles.roleBadge}>{item.role}</Text>
            </View>
            <Text style={styles.cardMeta}>{format(new Date(item.activities.start_time), 'EEE, MMM d · h:mm a')}</Text>
            <Text style={styles.cardMeta}>Status: {item.activities.status}</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { flex: 1, fontSize: typography.fontSizeLg, fontWeight: '600', color: colors.gray900 },
  roleBadge: {
    backgroundColor: colors.gray100,
    color: colors.gray700,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: typography.fontSizeXs,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  cardMeta: { fontSize: typography.fontSizeSm, color: colors.gray500, marginTop: spacing.xs },
  empty: { textAlign: 'center', color: colors.gray400, marginTop: spacing.xl },
})

