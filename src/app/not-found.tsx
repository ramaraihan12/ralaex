import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '2rem',
        textAlign: 'center',
        background: 'var(--color-bg-primary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '380px',
        }}
      >
        <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>🔍</span>
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          404
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Halaman tidak ditemukan
        </p>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-tertiary)',
            margin: 0,
          }}
        >
          Halaman yang Anda cari mungkin telah dipindahkan atau dihapus.
        </p>
        <Link
          href="/"
          style={{
            marginTop: '0.5rem',
            display: 'inline-block',
            padding: '0.625rem 1.5rem',
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            color: 'var(--color-text-inverse)',
            background: '#B8663B',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
