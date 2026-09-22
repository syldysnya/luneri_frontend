'use client'

import { createTheme } from '@mui/material/styles'

/**
 * One palette, defined explicitly.
 *
 * A second mode is an addition here rather than a rewrite of every component,
 * because components read palette tokens rather than literal colours. Nobody
 * has asked for a dark mode, so only the light palette is defined.
 */
export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: { main: '#3d5a80' },
		secondary: { main: '#ee6c4d' },
		background: { default: '#f7f7f5', paper: '#ffffff' }
	},
	shape: { borderRadius: 6 },
	typography: {
		fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
		h1: { fontSize: '1.75rem', fontWeight: 600 },
		h2: { fontSize: '1.25rem', fontWeight: 600 }
	}
})
