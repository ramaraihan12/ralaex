'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Notification } from '@/lib/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setNotifications(data as Notification[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchNotifications()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchNotifications])

  useEffect(() => {
    const channelId = Math.random().toString(36).substring(2, 15)
    const channel = supabase
      .channel(`notifications-realtime-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as Notification) : n
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = async (id: string) => {
    const { error: err } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (err) return { success: false, error: err.message }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    return { success: true }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id)

    if (unreadIds.length === 0) return { success: true }

    const { error: err } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    if (err) return { success: false, error: err.message }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    return { success: true }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  }
}
