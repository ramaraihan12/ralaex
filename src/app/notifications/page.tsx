'use client'

import { Bell, Loader2 } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import '@/styles/notifications.css'

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications()

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  return (
    <AppShell>
      <div className="notification-page">
        <h1>Notifikasi</h1>

        {unreadCount > 0 && (
          <div className="notification-page-actions">
            <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
              Tandai Semua Dibaca ({unreadCount})
            </button>
          </div>
        )}

        <div className="notification-list">
          {loading && (
            <div className="components-loading">
              <Loader2 size={20} className="spin" />
            </div>
          )}

          {error && (
            <div className="empty-state">
              <Bell size={32} />
              <p>Gagal memuat notifikasi</p>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="empty-state">
              <Bell size={32} />
              <p>Tidak ada notifikasi</p>
            </div>
          )}

          {!loading &&
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleMarkAsRead}
              />
            ))}
        </div>
      </div>
    </AppShell>
  )
}
