import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    // The app is used in WIB (UTC+7). Pinning the zone makes the
    // local-date vs UTC-date mistakes show up on any machine.
    env: { TZ: 'Asia/Jakarta' },
  },
})
