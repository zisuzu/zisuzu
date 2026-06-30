import { useEffect, useRef, useState } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useActivityChat } from '../../hooks/useActivityChat'
import { supabase } from '../../lib/supabase'
import { colors, spacing, typography, borderRadius } from '../../constants/theme'
import { format } from 'date-fns'

export default function ActivityChatScreen() {
  const { id: activityId } = useLocalSearchParams<{ id: string }>()
  const { messages, isLoading, sendMessage } = useActivityChat(activityId!)
  const [text, setText] = useState('')
  const [myId, setMyId] = useState<string | null>(null)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages.length])

  const handleSend = async () => {
    if (!text.trim()) return
    const msg = text.trim()
    setText('')
    await sendMessage(msg)
  }

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMe = item.sender_id === myId
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              {!isMe && (
                <Text style={styles.senderName}>
                  {(item.sender as any)?.display_name ?? 'User'}
                </Text>
              )}
              <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                {item.content}
              </Text>
              <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
                {format(new Date(item.created_at), 'h:mm a')}
              </Text>
            </View>
          )
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor={colors.gray400}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.gray50 },
  messageList:     { padding: spacing.md, gap: spacing.xs },
  bubble:          { maxWidth: '80%', padding: spacing.sm, borderRadius: borderRadius.lg, marginVertical: 2 },
  bubbleMe:        { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: borderRadius.sm },
  bubbleThem:      { backgroundColor: colors.white, alignSelf: 'flex-start', borderBottomLeftRadius: borderRadius.sm, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  senderName:      { fontSize: typography.fontSizeXs, color: colors.primary, fontWeight: '600', marginBottom: 2 },
  messageText:     { fontSize: typography.fontSizeMd, color: colors.gray900 },
  messageTextMe:   { color: colors.white },
  timestamp:       { fontSize: 10, color: colors.gray400, marginTop: 2, textAlign: 'right' },
  timestampMe:     { color: 'rgba(255,255,255,0.7)' },
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray100, gap: spacing.xs },
  input:           { flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: colors.gray50, borderRadius: borderRadius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, fontSize: typography.fontSizeMd, color: colors.gray900 },
  sendBtn:         { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.gray200 },
  sendBtnText:     { color: colors.white, fontSize: 18, fontWeight: '600' },
})

