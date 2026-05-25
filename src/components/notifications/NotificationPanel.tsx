'use client'

import { X, Bell, Loader2 } from 'lucide-react'
import { NotificationItem } from './NotificationItem'
import type { Notification } from '@/lib/types'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  notifications: Notification[]
  loading: boolean
  error: string | null
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationPanel({
  open,
  onClose,
  notifications,
  loading,
  error,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  return (
    <>
      {open && (
        <div className="notification-panel-backdrop" onClick={onClose} />
      )}

      <div className={`notification-panel ${open ? 'open' : ''}`}>
        <div className="notification-panel-header">
          <h3>Notifikasi</h3>
          <button
            className="notification-panel-close"
            onClick={onClose}
            aria-label="Tutup panel notifikasi"
          >
            <X size={20} />
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            className="notification-panel-mark-all"
            onClick={onMarkAllAsRead}
          >
            Tandai Semua Dibaca ({unreadCount})
          </button>
        )}

        <div className="notification-panel-list">
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
                onClick={onMarkAsRead}
              />
            ))}
        </div>
      </div>
    </>
  )
}
