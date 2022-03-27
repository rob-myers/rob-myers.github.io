import { QueryClient } from 'react-query';

export const queryClient = new QueryClient;

export const queryCache = queryClient.getQueryCache();
