import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { borderRadius, colors, spacing, typography } from '../../constants/theme'

type ProfileData = {
  display_name: string | null
  username: string | null
  bio: string | null
}

export default function ProfileTabScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [joinedCount, setJoinedCount] = useState(0)
  const [hostedCount, setHostedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setLoading(false)
      return
    }

    const [profileRes, joinedRes, hostedRes] = await Promise.all([
      supabase.from('profiles').select('display_name, username, bio').eq('id', userId).maybeSingle(),
      supabase
        .from('activity_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active'),
      supabase.from('activities').select('*', { count: 'exact', head: true }).eq('creator_id', userId),
    ])

    if (profileRes.data) {
      setProfile(profileRes.data as ProfileData)
    }

    setJoinedCount(joinedRes.count ?? 0)
    setHostedCount(hostedRes.count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert('Could not sign out', error.message)
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{profile?.display_name || 'Roame User'}</Text>
        <Text style={styles.handle}>@{profile?.username || 'new-user'}</Text>
        <Text style={styles.bio}>{profile?.bio || 'Tell people what kind of activities you enjoy.'}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{joinedCount}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{hostedCount}</Text>
            <Text style={styles.statLabel}>Hosted</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50, padding: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray100,
    gap: spacing.sm,
  },
  name: { fontSize: typography.fontSize2Xl, fontWeight: '700', color: colors.gray900 },
  handle: { fontSize: typography.fontSizeSm, color: colors.gray500 },
  bio: { fontSize: typography.fontSizeMd, color: colors.gray700, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  statItem: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  statValue: { fontSize: typography.fontSizeXl, fontWeight: '700', color: colors.gray900 },
  statLabel: { fontSize: typography.fontSizeSm, color: colors.gray500 },
  signOutBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.gray900,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signOutText: { color: colors.white, fontWeight: '600', fontSize: typography.fontSizeMd },
})

