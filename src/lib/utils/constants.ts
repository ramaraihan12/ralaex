export const USERNAME = 'ralaex'
export const USER_EMAIL = 'ralaex@ralaex.app'

export const NAV_ITEMS = [
  { label: 'Beranda', href: '/', icon: 'Home' },
  { label: 'Pemasukan', href: '/income', icon: 'TrendingUp' },
  { label: 'Tambah', href: '#', icon: 'Plus' },
  { label: 'Pengeluaran', href: '/outcome', icon: 'TrendingDown' },
  { label: 'Menu', href: '#', icon: 'Menu' },
] as const

export const MENU_ITEMS = [
  { label: 'Anggaran', href: '/budget', icon: 'Wallet' },
  { label: 'Transaksi Berulang', href: '/recurring', icon: 'Repeat' },
  { label: 'Data Master', href: '/master', icon: 'Database' },
  { label: 'Ekspor Data', href: '/export', icon: 'FileSpreadsheet' },
  { label: 'Notifikasi', href: '/notifications', icon: 'Bell' },
] as const
