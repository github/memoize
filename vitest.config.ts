import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['test/**/*.ts'],
    // Type-only fixture for standard decorators; see test/standard/tsconfig.json
    exclude: ['test/standard/**'],
  },
})
