'use client'

import { createElement } from 'react'
import {
  AlertTriangle,
  AlertOctagon,
  Clock,
  Trash2,
  CalendarClock,
  Bell,
} from 'lucide-react'
import { timeAgo } from '@/lib/utils/date'
import type { Notification } from '@/lib/types'

const TYPE_ICONS: Record<string, typeof Bell> = {
  budget_warning: AlertTriangle,
  budget_exceeded: AlertOctagon,
  recurring_reminder: Clock,
  yearly_cleanup: Trash2,
  bill_reminder: CalendarClock,
}

const TYPE_COLORS: Record<string, string> = {
  budget_warning: 'var(--color-warning)',
  budget_exceeded: 'var(--color-danger)',
  recurring_reminder: 'var(--color-secondary)',
  yearly_cleanup: 'var(--color-accent)',
  bill_reminder: 'var(--color-primary)',
}

interface NotificationItemProps {
  notification: Notification
  onClick: (id: string) => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const iconComponent = TYPE_ICONS[notification.type] || Bell
  const iconColor = TYPE_COLORS[notification.type] || 'var(--color-text-tertiary)'

  return (
    <button
      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
      onClick={() => onClick(notification.id)}
    >
      <span
        className="notification-item-icon"
        style={{ background: iconColor + '1A', color: iconColor }}
      >
        {createElement(iconComponent, { size: 18 })}
      </span>
      <div className="notification-item-content">
        <span className="notification-item-title">
          {notification.title}
          {!notification.is_read && (
            <span className="notification-item-dot" />
          )}
        </span>
        <span className="notification-item-message">{notification.message}</span>
        <span className="notification-item-time">
          {timeAgo(notification.created_at)}
        </span>
      </div>
    </button>
  )
}
