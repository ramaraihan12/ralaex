'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  TrendingUp,
  TrendingDown,
  Wallet,
  Repeat,
  Database,
  FileSpreadsheet,
  Bell,
  LogOut,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import '@/styles/layout.css'

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <Image
          src="/logo/logo-removebg-preview.png"
          alt="RaLaEX"
          width={32}
          height={32}
          className="sidebar-logo"
        />
        <span className="sidebar-title">RaLaEX</span>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <Link
            href="/"
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Home size={20} />
            <span>Beranda</span>
          </Link>
          <Link
            href="/income"
            className={`nav-item ${isActive('/income') ? 'active' : ''}`}
            onClick={onClose}
          >
            <TrendingUp size={20} />
            <span>Pemasukan</span>
          </Link>
          <Link
            href="/outcome"
            className={`nav-item ${isActive('/outcome') ? 'active' : ''}`}
            onClick={onClose}
          >
            <TrendingDown size={20} />
            <span>Pengeluaran</span>
          </Link>
        </div>

        <div className="nav-section" style={{ marginTop: 'var(--space-md)' }}>
          <span className="nav-section-label">Menu</span>
          <Link
            href="/budget"
            className={`nav-item ${isActive('/budget') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Wallet size={20} />
            <span>Anggaran</span>
          </Link>
          <Link
            href="/recurring"
            className={`nav-item ${isActive('/recurring') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Repeat size={20} />
            <span>Transaksi Berulang</span>
          </Link>
          <Link
            href="/master"
            className={`nav-item ${isActive('/master') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Database size={20} />
            <span>Data Master</span>
          </Link>
          <Link
            href="/export"
            className={`nav-item ${isActive('/export') ? 'active' : ''}`}
            onClick={onClose}
          >
            <FileSpreadsheet size={20} />
            <span>Ekspor Data</span>
          </Link>
          <Link
            href="/notifications"
            className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Bell size={20} />
            <span>Notifikasi</span>
          </Link>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn-logout"
          onClick={() => {
            onClose?.()
            handleLogout()
          }}
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
