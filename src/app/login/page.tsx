'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { login } from './actions'
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
