import type { ReactNode } from 'react'

/**
 * Admin chrome.
 *
 * `(admin)` does not appear in any URL — it groups routes under this layout.
 * Authentication lands here when it arrives. Until then this boundary is
 * organisational: it keeps the internal UI from sharing code paths with the
 * user-facing one, and it keeps nobody out. Access control lives at the API.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
	return <>{children}</>
}
