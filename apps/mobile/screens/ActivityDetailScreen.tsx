import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { borderRadius, colors, spacing, typography } from '../constants/theme'

type ActivityRow = {
  id: string
  creator_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  max_participants: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

type ProfileRow = {
  id: string
  display_name: string | null
  username: string | null
}

export default function ActivityDetailScreen() {
  const { id: activityId } = useLocalSearchParams<{ id: string }>()
  const [activity, setActivity] = useState<ActivityRow | null>(null)
  const [host, setHost] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [isParticipant, setIsParticipant] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)

  const spotsLeft = useMemo(() => {
    if (!activity) return 0
    return Math.max(activity.max_participants - participantCount, 0)
  }, [activity, participantCount])

  const load = async () => {
    if (!activityId) return

    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const myId = userData.user?.id

    const [{ data: activityData, error: activityError }, countRes, participantRes] = await Promise.all([
      supabase
        .from('activities')
        .select('id, creator_id, title, description, start_time, end_time, max_participants, status')
        .eq('id', activityId)
        .single(),
      supabase
        .from('activity_participants')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId)
        .eq('status', 'active'),
      myId
        ? supabase
            .from('activity_participants')
            .select('id')
            .eq('activity_id', activityId)
            .eq('user_id', myId)
            .eq('status', 'active')
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    if (activityError || !activityData) {
      Alert.alert('Not found', 'Unable to load this activity.')
      router.back()
      return
    }

    setActivity(activityData as ActivityRow)
    setParticipantCount(countRes.count ?? 0)
    setIsParticipant(Boolean((participantRes as any).data))

    const { data: hostData } = await supabase
      .from('profiles')
      .select('id, display_name, username')
      .eq('id', activityData.creator_id)
      .maybeSingle()

    setHost((hostData as ProfileRow | null) ?? null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [activityId])

  const handleJoin = async () => {
    if (!activityId) return
    const { data: userData } = await supabase.auth.getUser()
    const myId = userData.user?.id
    if (!myId) {
      Alert.alert('Login required', 'Please sign in again to join activities.')
      return
    }

    setBusy(true)
    const { error } = await supabase.from('activity_participants').insert({
      activity_id: activityId,
      user_id: myId,
      role: 'participant',
      status: 'active',
    })

    setBusy(false)
    if (error) {
      Alert.alert('Could not join', error.message)
      return
    }

    await load()
  }

  const handleLeave = async () => {
    if (!activityId) return
    const { data: userData } = await supabase.auth.getUser()
    const myId = userData.user?.id
    if (!myId) return

    setBusy(true)
    const { error } = await supabase
      .from('activity_participants')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', myId)

    setBusy(false)
    if (error) {
      Alert.alert('Could not leave', error.message)
      return
    }

    await load()
  }

  if (loading || !activity) {
    return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{activity.title}</Text>
      <Text style={styles.meta}>Starts {format(new Date(activity.start_time), 'EEE, MMM d · h:mm a')}</Text>
      {activity.end_time ? (
        <Text style={styles.meta}>Ends {format(new Date(activity.end_time), 'EEE, MMM d · h:mm a')}</Text>
      ) : null}

      <View style={styles.badgeRow}>
        <Text style={styles.badge}>Status: {activity.status}</Text>
        <Text style={styles.badge}>{participantCount}/{activity.max_participants} joined</Text>
      </View>

      <Text style={styles.label}>Hosted by</Text>
      <Text style={styles.value}>{host?.display_name ?? host?.username ?? 'Roame user'}</Text>

      <Text style={styles.label}>About</Text>
      <Text style={styles.value}>{activity.description?.trim() || 'No description yet.'}</Text>

      <Text style={styles.spots}>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'This activity is full'}</Text>

      <TouchableOpacity
        style={styles.chatBtn}
        onPress={() => router.push(`./ActivityChatScreen?id=${activity.id}`)}
      >
        <Text style={styles.chatBtnText}>Open Group Chat</Text>
      </TouchableOpacity>

      {isParticipant ? (
        <TouchableOpacity style={[styles.actionBtn, styles.leaveBtn, busy && styles.disabled]} onPress={handleLeave} disabled={busy}>
          <Text style={styles.actionBtnText}>{busy ? 'Please wait...' : 'Leave Activity'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.actionBtn, busy && styles.disabled]} onPress={handleJoin} disabled={busy || spotsLeft === 0}>
          <Text style={styles.actionBtnText}>{busy ? 'Please wait...' : spotsLeft === 0 ? 'No Spots Left' : 'Join Activity'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  content: { padding: spacing.lg, gap: spacing.sm },
  backBtn: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  backText: { color: colors.primary, fontWeight: '600', fontSize: typography.fontSizeMd },
  title: { fontSize: typography.fontSize3Xl, fontWeight: '700', color: colors.gray900 },
  meta: { fontSize: typography.fontSizeSm, color: colors.gray500 },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', marginTop: spacing.xs },
  badge: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    color: colors.gray700,
    fontSize: typography.fontSizeXs,
  },
  label: { marginTop: spacing.md, color: colors.gray500, fontSize: typography.fontSizeSm, fontWeight: '600' },
  value: { color: colors.gray900, fontSize: typography.fontSizeMd, lineHeight: 22 },
  spots: { marginTop: spacing.md, color: colors.gray700, fontWeight: '600' },
  chatBtn: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  chatBtnText: { color: colors.primary, fontWeight: '600' },
  actionBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  leaveBtn: { backgroundColor: colors.error },
  actionBtnText: { color: colors.white, fontWeight: '600', fontSize: typography.fontSizeMd },
  disabled: { opacity: 0.6 },
})

