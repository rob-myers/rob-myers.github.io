import { QueryClient } from 'react-query';

/**
 * Singleton instance for entire App.
 */
export const queryClient = new QueryClient;

export const queryCache = queryClient.getQueryCache();

/**
 * @param {string} queryKey
 * @returns {any | undefined}
 */
export function getCached(queryKey) {
  return queryCache.find(queryKey)?.state.data;
}

/**
 * @template T
 * @param {string} queryKey 
 * @param {import('react-query/types/core/utils').Updater<T | undefined, T>} updater 
 */
export function setCached(queryKey, updater) {
  // TODO review options
  queryClient.setQueryDefaults(queryKey, { cacheTime: Infinity, staleTime: Infinity });
  queryClient.setQueryData(queryKey, updater);
}

/**
 * @param {string} queryKey 
 */
export function removeCached(queryKey) {
  const query = queryCache.find(queryKey);
  query && queryCache.remove(query);
}
