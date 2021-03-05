export function getWindow<T extends Record<string, any>>(): (Window & T) | undefined {
  return typeof window === 'undefined'
    ? undefined
    : window as unknown as (Window & T);
}
