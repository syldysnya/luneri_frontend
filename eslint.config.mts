import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
	{ ignores: ['node_modules/**', '.next/**', 'coverage/**', 'next-env.d.ts'] },
	js.configs.recommended,
	tseslint.configs.recommended,
	{
		files: ['src/**/*.{ts,tsx}'],
		plugins: { 'react-hooks': reactHooks },
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			// A console call is a debugging leftover or a log that belongs in a
			// logger. Errors rather than warns, so the gate catches it.
			'no-console': 'error'
		}
	}
])
