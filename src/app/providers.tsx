'use client'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'

import { ReduxProvider } from '@/store/ReduxProvider'
import { theme } from '@/theme/theme'

/**
 * Every context the application runs inside, in one place.
 *
 * A named seam rather than a stack inlined in the root layout: a test can
 * render this and assert that a component below it really receives the store
 * and the theme. Inlined in the layout, removing a provider breaks nothing any
 * check can see until a page throws at runtime.
 */
export function Providers({ children }: { children: ReactNode }) {
	return (
		<ReduxProvider>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ReduxProvider>
	)
}
