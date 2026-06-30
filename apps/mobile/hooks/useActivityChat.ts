import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useActivityChat(activityId: string) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Fetch conversation id then messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['activity-messages', activityId],
    queryFn: async () => {
      // Get conversation
      const { data: conv, error: convErr } = await supabase
        .from('activity_conversations')
        .select('id')
        .eq('activity_id', activityId)
        .single()

      if (convErr) throw convErr

      // Get messages with sender profile
      const { data, error } = await supabase
        .from('activity_messages')
        .select(`
          id, content, message_type, media_url, created_at, is_deleted,
          sender:profiles!sender_id(id, display_name, avatar_url)
        `)
        .eq('conversation_id', conv.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error
      return { conversationId: conv.id, messages: data }
    },
    enabled: !!activityId,
  })

  // Subscribe to realtime new messages
  useEffect(() => {
    if (!messages?.conversationId) return

    const channel = supabase
      .channel(`chat:${messages.conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_messages',
          filter: `conversation_id=eq.${messages.conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity-messages', activityId] })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [messages?.conversationId, activityId, queryClient])

  const sendMessage = async (content: string) => {
    if (!messages?.conversationId) return
    const { error } = await supabase.from('activity_messages').insert({
      conversation_id: messages.conversationId,
      sender_id: (await supabase.auth.getUser()).data.user!.id,
      content,
      message_type: 'text',
    })
    if (error) throw error
  }

  return { messages: messages?.messages ?? [], isLoading, sendMessage }
}

