import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { baseApi } from '@/store/api/baseApi'
import { streamsApi } from '@/store/api/streamsApi'
import { makeStore } from '@/store/store'

describe('the store mounts the api', () => {
	it('puts the api reducer under its own path', () => {
		expect(makeStore().getState()).toHaveProperty(baseApi.reducerPath)
	})

	describe('independent caches', () => {
		beforeEach(() => {
			vi.stubGlobal(
				'fetch',
				vi.fn(
					async () =>
						new Response(JSON.stringify({}), {
							status: 200,
							headers: { 'content-type': 'application/json' }
						})
				)
			)
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it('gives each call to makeStore an independent cache', async () => {
			// The claim is isolation, so demonstrate it: a query cached in one store
			// must be absent from the other. Comparing two fresh state objects for
			// reference inequality would pass no matter how leaky the stores were.
			const first = makeStore()
			const second = makeStore()

			await first.dispatch(streamsApi.endpoints.getStream.initiate(7))

			expect(Object.keys(first.getState().api.queries)).not.toHaveLength(0)
			expect(Object.keys(second.getState().api.queries)).toHaveLength(0)
		})
	})
})
