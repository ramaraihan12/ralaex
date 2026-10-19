'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: { error?: string }, formData: FormData) {
  const username = formData.get('username') as string | null
  const password = formData.get('password') as string | null

  if (!username || !password) {
    return { error: 'Username dan password harus diisi' }
  }

  const email = `${username}@ralaex.app`

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Same as lib/supabase/server.ts: only throws outside a server
            // action, and the middleware refreshes the session anyway.
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Username atau password salah' }
  }

  redirect('/')
}
