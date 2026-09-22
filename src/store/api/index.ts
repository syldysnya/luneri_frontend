/**
 * Where components import query hooks from.
 *
 * One import site for every resource, so adding one is a line here rather than
 * a new path every component has to learn.
 */
export { API_URL, baseApi } from './baseApi'
export { streamsApi, useGetStreamQuery } from './streamsApi'
