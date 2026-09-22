import type { StreamResponse } from '@/types/stream'

import { baseApi } from './baseApi'

export const streamsApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getStream: builder.query<StreamResponse, number>({
			query: streamId => `/streams/${streamId}`,
			providesTags: (_result, _error, streamId) => [{ type: 'Stream', id: streamId }]
		})
	})
})

export const { useGetStreamQuery } = streamsApi
