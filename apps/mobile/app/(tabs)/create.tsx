import { useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { borderRadius, colors, spacing, typography } from '../../constants/theme'

export default function CreateActivityScreen() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('10')
  const [startsInHours, setStartsInHours] = useState('2')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Please enter an activity title.')
      return
    }

    const parsedMax = Number(maxParticipants)
    if (!Number.isFinite(parsedMax) || parsedMax < 2) {
      Alert.alert('Invalid capacity', 'Max participants should be at least 2.')
      return
    }

    const parsedStartHours = Number(startsInHours)
    if (!Number.isFinite(parsedStartHours) || parsedStartHours < 0) {
      Alert.alert('Invalid start time', 'Starts in hours should be zero or greater.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      Alert.alert('Session expired', 'Please sign in again.')
      return
    }

    setLoading(true)

    const startTime = new Date(Date.now() + parsedStartHours * 60 * 60 * 1000).toISOString()
    const { data: activity, error: createError } = await supabase
      .from('activities')
      .insert({
        creator_id: userId,
        title: trimmedTitle,
        description: description.trim() || null,
        start_time: startTime,
        max_participants: parsedMax,
      })
      .select('id')
      .single()

    if (createError || !activity) {
      setLoading(false)
      Alert.alert('Create failed', createError?.message ?? 'Could not create activity.')
      return
    }

    const { error: participantError } = await supabase.from('activity_participants').insert({
      activity_id: activity.id,
      user_id: userId,
      role: 'host',
      status: 'active',
    })

    setLoading(false)

    if (participantError) {
      Alert.alert('Created with warning', `Activity created but host setup failed: ${participantError.message}`)
      return
    }

    Alert.alert('Success', 'Your activity is live now.', [
      { text: 'View Activity', onPress: () => router.replace(`../screens/ActivityDetailScreen?id=${activity.id}`) },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Activity</Text>
      <Text style={styles.subtitle}>Launch quickly and invite nearby people.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Morning Run @ Beach"
          placeholderTextColor={colors.gray400}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What should people know before they join?"
          placeholderTextColor={colors.gray400}
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={300}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Max people</Text>
          <TextInput
            style={styles.input}
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="number-pad"
          />
        </View>

        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Starts in (hours)</Text>
          <TextInput
            style={styles.input}
            value={startsInHours}
            onChangeText={setStartsInHours}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Activity'}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: typography.fontSize3Xl, fontWeight: '700', color: colors.gray900 },
  subtitle: { fontSize: typography.fontSizeMd, color: colors.gray500 },
  field: { gap: spacing.xs },
  label: { fontSize: typography.fontSizeSm, color: colors.gray700, fontWeight: '600' },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizeMd,
    color: colors.gray900,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontWeight: '600', fontSize: typography.fontSizeMd },
})

