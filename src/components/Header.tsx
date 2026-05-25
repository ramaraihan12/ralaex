'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Bell, Menu } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import '@/styles/notifications.css'

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [panelOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleBellClick = () => {
    setPanelOpen((prev) => !prev)
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="header-btn hamburger-btn"
          onClick={onMenuClick}
          aria-label="Buka menu"
        >
          <Menu size={20} className="header-btn-icon" />
        </button>
        <Image
          src="/logo/logo-removebg-preview.png"
          alt="RaLaEX"
          width={32}
          height={32}
          className="header-logo"
        />
        <span className="header-title">RaLaEX</span>
      </div>

      <div className="header-right">
        <div className="notification-bell-wrapper" ref={panelRef}>
          <button
            ref={bellRef}
            className="header-btn notification-badge"
            onClick={handleBellClick}
            aria-label="Notifikasi"
          >
            <Bell size={20} className="header-btn-icon" />
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          <NotificationPanel
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
            notifications={notifications.slice(0, 10)}
            loading={loading}
            error={error}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        </div>
        <button className="header-avatar" onClick={handleLogout}>
          R
        </button>
      </div>
    </header>
  )
}
