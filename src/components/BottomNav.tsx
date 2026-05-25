'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Plus, TrendingDown, Menu } from 'lucide-react'
import '@/styles/layout.css'

const NAV_ICONS: Record<string, React.ReactNode> = {
  Home: <Home />,
  TrendingUp: <TrendingUp />,
  Plus: <Plus />,
  TrendingDown: <TrendingDown />,
  Menu: <Menu />,
}

const BOTTOM_NAV_ITEMS = [
  { label: 'Beranda', href: '/', icon: 'Home' },
  { label: 'Pemasukan', href: '/income', icon: 'TrendingUp' },
  { label: 'Tambah', href: '#', icon: 'Plus' },
  { label: 'Pengeluaran', href: '/outcome', icon: 'TrendingDown' },
  { label: 'Menu', href: '#', icon: 'Menu' },
] as const

interface BottomNavProps {
  onQuickAdd?: () => void
  onMenuClick?: () => void
}

export function BottomNav({ onQuickAdd, onMenuClick }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '#') return false
    return pathname.startsWith(href)
  }

  const handleClick = (e: React.MouseEvent, href: string, icon: string) => {
    if (href === '#' && icon === 'Plus') {
      e.preventDefault()
      onQuickAdd?.()
    }
    if (href === '#' && icon === 'Menu') {
      e.preventDefault()
      onMenuClick?.()
    }
  }

  return (
    <nav className="bottom-nav">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const active = isActive(item.href)
        const isCenter = item.icon === 'Plus'

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-item ${active ? 'active' : ''} ${isCenter ? 'center-btn' : ''}`}
            onClick={(e) => handleClick(e, item.href, item.icon)}
          >
            {isCenter ? (
              <span className="center-circle">
                {NAV_ICONS[item.icon]}
              </span>
            ) : (
              <>
                {NAV_ICONS[item.icon]}
                <span className="nav-label">{item.label}</span>
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
