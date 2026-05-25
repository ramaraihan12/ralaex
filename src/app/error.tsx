'use client'

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
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
        <span style={{ fontSize: '3rem', lineHeight: 1 }}>⚠</span>
        <h1
          style={{
            fontSize: 'var(--font-size-xl)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Terjadi Kesalahan
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        {error.message && (
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-danger)',
              margin: 0,
              padding: '0.5rem 0.75rem',
              background: 'var(--color-danger-light)',
              borderRadius: 'var(--radius-sm)',
              wordBreak: 'break-word',
            }}
          >
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            padding: '0.625rem 1.5rem',
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            color: 'var(--color-text-inverse)',
            background: '#B8663B',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
