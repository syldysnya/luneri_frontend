import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { baseApi } from './api/baseApi'

/**
 * Build a store.
 *
 * A factory rather than only a singleton: every test gets its own store, so one
 * test's cached response cannot leak into the next. `baseApi.middleware` is not
 * optional — without it every query hangs on `isLoading` forever, with no error
 * and no warning.
 */
export const makeStore = () =>
	configureStore({
		reducer: { [baseApi.reducerPath]: baseApi.reducer },
		middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware)
	})

/** The application's store. Tests build their own with `makeStore`. */
export const store = makeStore()

// Refetch on focus and on reconnect.
setupListeners(store.dispatch)

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
