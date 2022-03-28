import { QueryClient } from 'react-query';

export const queryClient = new QueryClient;

export const queryCache = queryClient.getQueryCache();

/**
 * @param {string} queryKey
 * @returns {any | undefined}
 */
export function getCachedItem(queryKey) {
  return queryCache.find(queryKey)?.state.data;
}
