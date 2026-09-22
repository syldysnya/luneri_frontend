import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * The backend's address. Public by construction — NEXT_PUBLIC_ inlines it into
 * the client bundle, which is correct for a base URL and wrong for a secret.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/**
 * The one API. Every resource injects into this rather than calling createApi
 * again: a second createApi is a second cache, a second middleware to register,
 * and two invalidation graphs that can never invalidate each other.
 */
export const baseApi = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
	tagTypes: ['Stream'],
	endpoints: () => ({})
})
