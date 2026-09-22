import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API_URL } from '@/store/api/baseApi'
import { streamsApi } from '@/store/api/streamsApi'
import { makeStore } from '@/store/store'
import type { StreamResponse } from '@/types/stream'

/** A real response body, copied from the running backend. */
const STREAM: StreamResponse = {
	id: 7,
	title: '1-laughter',
	source_path: '/videos/benchmark/1-laughter.mp4',
	duration_seconds: 33.723,
	file_size_bytes: 26939164,
	ingested_at: '2026-09-22T17:39:37.494719Z',
	steps: [
		{ stage: 'ingest', status: 'completed' },
		{ stage: 'transcript', status: 'not_run' },
		{ stage: 'ocr', status: 'not_run' },
		{ stage: 'audio', status: 'not_run' }
	]
}

describe('the stream query is wired to the store', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(
				async () =>
					new Response(JSON.stringify(STREAM), {
						status: 200,
						headers: { 'content-type': 'application/json' }
					})
			)
		)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('requests the documented URL and caches what comes back', async () => {
		// This one assertion covers three silent failures at once: a store
		// missing RTK Query's middleware (every hook would hang on isLoading
		// forever, with no error), a wrong base URL, and a wrong endpoint path.
		const store = makeStore()

		const result = await store.dispatch(streamsApi.endpoints.getStream.initiate(7))

		const request = vi.mocked(fetch).mock.calls[0][0] as Request
		expect(request.url).toBe(`${API_URL}/streams/7`)
		expect(result.data).toEqual(STREAM)
	})
})
