import { UseQueryOptions } from "react-query";

export async function handleJsonFetch(resp: Response) {
  if (!resp.ok) {
    throw Error(`${resp.statusText}: ${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}

export const useQueryOptions: UseQueryOptions<any, any, any, any> = {
  onError: console.error,
  refetchOnWindowFocus: false,
  retry: false,
};
