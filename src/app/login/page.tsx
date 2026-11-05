'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { login } from './actions'
import { isDemo, DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo'
import '@/styles/login.css'

const initialState = { error: undefined as string | undefined }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="login-page">
      <div className="login-card">
        <Image
          src="/logo/RaLaEXfullLogo.png"
          alt="RaLaEX"
          width={180}
          height={80}
          className="login-logo"
          priority
        />

        {isDemo && (
          <div className="login-demo">
            <strong>Demo login</strong>
            <span>Username: <code>{DEMO_EMAIL}</code></span>
            <span>Password: <code>{DEMO_PASSWORD}</code></span>
            <p>One account shared by every visitor. All entries are fictional, so please don&apos;t type in anything real.</p>
          </div>
        )}

        <form action={formAction} className="login-form">
          {state.error && (
            <div className="login-error">{state.error}</div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Masukkan username"
              defaultValue={isDemo ? DEMO_EMAIL : undefined}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              defaultValue={isDemo ? DEMO_PASSWORD : undefined}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={isPending}>
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
