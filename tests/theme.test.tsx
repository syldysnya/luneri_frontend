import { render, screen } from '@testing-library/react'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'

import { theme } from '@/theme/theme'

describe('the theme', () => {
	it('resolves a palette children can read', () => {
		// A theme that fails to build throws here rather than rendering an
		// unstyled page that looks merely wrong.
		expect(theme.palette.primary.main).toBeTruthy()
		expect(theme.palette.mode).toBe('light')
	})

	it('applies through a provider without throwing', () => {
		render(
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Typography>rendered</Typography>
			</ThemeProvider>
		)

		expect(screen.getByText('rendered')).toBeInTheDocument()
	})
})
