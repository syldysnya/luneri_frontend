import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './store'

/** Typed `useDispatch`, so thunks type-check at the call site. */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/** Typed `useSelector`, so the state shape is known without annotating it. */
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector)
