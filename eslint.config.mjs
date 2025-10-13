import {defineConfig} from 'eslint/config'
import tsParser from '@typescript-eslint/parser'
import github from 'eslint-plugin-github'
import escompat from 'eslint-plugin-escompat'
import compat from 'eslint-plugin-compat'
import globals from 'globals'

const githubFlatConfigs = github.getFlatConfigs()

export default defineConfig([
  githubFlatConfigs.browser,
  githubFlatConfigs.recommended,
  ...githubFlatConfigs.typescript,
  ...escompat.configs['flat/typescript'],
  {
    ignores: ['dist/**', 'node_modules/**'],
    plugins: {
      compat,
      escompat,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.builtin,
      },
    },
    rules: {
      'no-invalid-this': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: {
          extensions: ['.js', '.ts', '.tsx'],
          moduleDirectory: ['node_modules'],
        },
      },
    },
  },
  {
    files: ['test/*'],
    rules: {
      'no-shadow': 'off',
    },
  },
])
