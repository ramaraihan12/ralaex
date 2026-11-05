import { describe, expect, it } from 'vitest'
import { loginEmail } from './demo'

describe('loginEmail', () => {
  it('keeps turning a username into a ralaex.app address', () => {
    expect(loginEmail('rama', false)).toBe('rama@ralaex.app')
    expect(loginEmail('rama', true)).toBe('rama@ralaex.app')
  })

  it('only lets a full email through in demo mode', () => {
    expect(loginEmail('demo@example.com', true)).toBe('demo@example.com')
    expect(loginEmail('demo@example.com', false)).toBe('demo@example.com@ralaex.app')
  })
})
