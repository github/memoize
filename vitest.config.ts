import {defineConfig} from 'vitest/config'
import {ModuleKind, ScriptTarget, transpileModule} from 'typescript'

export default defineConfig({
  plugins: [
    {
      // Oxc only lowers legacy decorators, so compile test/standard with TypeScript's standard decorators instead.
      name: 'standard-decorators',
      enforce: 'pre',
      transform(code: string, id: string) {
        if (!id.includes('/test/standard/')) return
        const {outputText, sourceMapText} = transpileModule(code, {
          fileName: id,
          compilerOptions: {
            experimentalDecorators: false,
            target: ScriptTarget.ES2022,
            module: ModuleKind.ESNext,
            sourceMap: true,
          },
        })
        return {code: outputText, map: sourceMapText}
      },
    },
  ],
  test: {
    globals: false,
    environment: 'node',
    include: ['test/**/*.ts'],
    // Type-only fixtures; see test/types/tsconfig.json
    exclude: ['test/types/**'],
  },
})
