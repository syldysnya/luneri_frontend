import { render, screen } from '@testing-library/react'
import { useTheme } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'
import { useStore } from 'react-redux'

import { Providers } from '@/app/providers'
import { baseApi } from '@/store/api/baseApi'

/** Reads both contexts the app promises its pages. */
function Probe() {
	const store = useStore()
	const theme = useTheme()
	const hasApi = baseApi.reducerPath in (store.getState() as object)
	return <div data-testid="probe">{`${hasApi}:${theme.palette.primary.main}`}</div>
}

describe('the application provider stack', () => {
	it('gives components below it both the store and the theme', () => {
		// Removing a provider from the stack breaks nothing tsc, eslint or the
		// build can see — a page just throws at runtime. This is what notices.
		render(
			<Providers>
				<Probe />
			</Providers>
		)

		expect(screen.getByTestId('probe')).toHaveTextContent('true:#3d5a80')
	})
})
