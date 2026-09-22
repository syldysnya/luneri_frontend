import type { ReactNode } from 'react'

/**
 * User-facing chrome. Empty, and deliberately separate from `(admin)`: a page
 * in this tree must have no code path that can render an internal field such as
 * a source path.
 */
export default function UserLayout({ children }: { children: ReactNode }) {
	return <>{children}</>
}
