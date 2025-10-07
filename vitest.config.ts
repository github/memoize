import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/setup.ts'],
    setupFiles: ['./test/setup.ts'],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true
    }
  }
})
