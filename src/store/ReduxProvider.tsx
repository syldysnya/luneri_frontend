'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { Provider } from 'react-redux'

import type { AppStore } from './store'
import { makeStore } from './store'

/**
 * The 'use client' boundary for Redux.
 *
 * Kept in its own module so the root layout stays a server component: marking
 * the layout itself would make every page below it client-rendered.
 *
 * The store is built per instance rather than imported from module scope. A
 * 'use client' module still executes on the server during SSR, so a module-scope
 * singleton would be one store shared by every request the process serves —
 * harmless while nothing prefetches server-side, and a cross-request data leak
 * the moment something does.
 */
export function ReduxProvider({ children }: { children: ReactNode }) {
	const storeRef = useRef<AppStore>(undefined)
	if (!storeRef.current) {
		storeRef.current = makeStore()
	}

	return <Provider store={storeRef.current}>{children}</Provider>
}
