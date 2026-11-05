// The public demo runs with NEXT_PUBLIC_DEMO_MODE=true. Visitors share one
// fictional account there, so its login is printed on the page on purpose.
export const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export const DEMO_EMAIL = 'demo@example.com'
export const DEMO_PASSWORD = 'demo-ralaex-2026'

// Household logins are short names on @ralaex.app. The demo account isn't on
// that domain, so demo mode lets a full email through as typed.
export function loginEmail(username: string, demo = isDemo): string {
  return demo && username.includes('@') ? username : `${username}@ralaex.app`
}
